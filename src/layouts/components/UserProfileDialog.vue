<template>
  <el-dialog
    :model-value="modelValue"
    title="Thông tin tài khoản"
    width="560px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="user-meta-header" v-if="authStore.user">
      <div class="meta-avatar">{{ (authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}</div>
      <div class="meta-info">
        <span class="meta-name">{{ authStore.user?.fullName || authStore.user?.username }}</span>
        <span class="meta-sub">@{{ authStore.user?.username }} • {{ (authStore.roles || []).join(', ') }}</span>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="profile-dialog-form"
    >
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="Họ và tên (*)" prop="fullName">
            <el-input v-model="form.fullName" placeholder="Nhập họ và tên..." clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Số điện thoại" prop="phone">
            <el-input v-model="form.phone" placeholder="VD: 0901234567" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Địa chỉ Email" prop="email">
        <el-input v-model="form.email" placeholder="VD: email@example.com" clearable />
      </el-form-item>

      <!-- ADDRESS PICKER SECTION -->
      <div class="address-builder-section">
        <div class="address-section-header">
          <span class="sec-label">ĐỊA CHỈ LIÊN HỆ / GIAO HÀNG (Đ/C)</span>
          <button
            type="button"
            class="btn-toggle-address-mode"
            @click="showAddressSelects = !showAddressSelects"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ showAddressSelects ? 'Nhập tay tự do' : '⚡ Chọn nhanh Tỉnh/Huyện/Xã' }}</span>
          </button>
        </div>

        <!-- Fast Cascade Dropdowns (City -> District -> Ward) -->
        <div v-if="showAddressSelects" class="cascade-address-container">
          <div class="cascade-row-3col">
            <el-form-item label="Tỉnh / Thành phố" class="cascade-item">
              <el-select
                v-model="selectedProvinceCode"
                placeholder="Chọn Tỉnh / TP"
                filterable
                clearable
                :loading="loadingProvinces"
                @change="handleProvinceChange"
                style="width: 100%"
              >
                <el-option
                  v-for="p in provincesList"
                  :key="p.code"
                  :label="p.name"
                  :value="p.code"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Quận / Huyện" class="cascade-item">
              <el-select
                v-model="selectedDistrictCode"
                placeholder="Chọn Quận / Huyện"
                filterable
                clearable
                :disabled="!selectedProvinceCode"
                :loading="loadingDistricts"
                @change="handleDistrictChange"
                style="width: 100%"
              >
                <el-option
                  v-for="d in districtsList"
                  :key="d.code"
                  :label="d.name"
                  :value="d.code"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Phường / Xã" class="cascade-item">
              <el-select
                v-model="selectedWardCode"
                placeholder="Chọn Phường / Xã"
                filterable
                clearable
                :disabled="!selectedDistrictCode"
                :loading="loadingWards"
                @change="handleWardChange"
                style="width: 100%"
              >
                <el-option
                  v-for="w in wardsList"
                  :key="w.code"
                  :label="w.name"
                  :value="w.code"
                />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="Số nhà, tên đường" class="cascade-item">
            <el-input
              v-model="streetAddress"
              placeholder="VD: Số 18 ngõ 42 Phố Huế..."
              @input="rebuildFullAddress"
              clearable
            />
          </el-form-item>
        </div>

        <!-- Full Address Preview / Direct Edit -->
        <el-form-item :label="showAddressSelects ? 'Địa chỉ hoàn chỉnh tạo từ API:' : 'Địa chỉ chi tiết:'" class="cascade-item full-addr-item">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
            clearable
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Đóng</el-button>
      <el-button type="primary" :loading="loading" @click="submitUpdateProfile">
        Lưu thay đổi
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { vnAddressService } from '@/services/vnAddressService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  address: ''
})

const rules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }]
}

// FAST CASCADE ADDRESS STATE (Provinces API)
const showAddressSelects = ref(true)
const provincesList = ref([])
const districtsList = ref([])
const wardsList = ref([])

const selectedProvinceCode = ref(null)
const selectedDistrictCode = ref(null)
const selectedWardCode = ref(null)
const streetAddress = ref('')

const provinceName = ref('')
const districtName = ref('')
const wardName = ref('')

const loadingProvinces = ref(false)
const loadingDistricts = ref(false)
const loadingWards = ref(false)

const loadProvinces = async () => {
  if (provincesList.value.length > 0) return
  loadingProvinces.value = true
  try {
    provincesList.value = await vnAddressService.getProvinces()
  } catch (err) {
    console.error('Lỗi nạp Tỉnh/TP:', err)
  } finally {
    loadingProvinces.value = false
  }
}

const handleProvinceChange = async (val) => {
  selectedDistrictCode.value = null
  selectedWardCode.value = null
  districtName.value = ''
  wardName.value = ''
  districtsList.value = []
  wardsList.value = []

  const found = provincesList.value.find(p => p.code === val)
  provinceName.value = found ? found.name : ''
  rebuildFullAddress()

  if (val) {
    loadingDistricts.value = true
    try {
      districtsList.value = await vnAddressService.getDistricts(val)
    } catch (err) {
      console.error('Lỗi nạp Quận/Huyện:', err)
    } finally {
      loadingDistricts.value = false
    }
  }
}

const handleDistrictChange = async (val) => {
  selectedWardCode.value = null
  wardName.value = ''
  wardsList.value = []

  const found = districtsList.value.find(d => d.code === val)
  districtName.value = found ? found.name : ''
  rebuildFullAddress()

  if (val) {
    loadingWards.value = true
    try {
      wardsList.value = await vnAddressService.getWards(val)
    } catch (err) {
      console.error('Lỗi nạp Phường/Xã:', err)
    } finally {
      loadingWards.value = false
    }
  }
}

const handleWardChange = (val) => {
  const found = wardsList.value.find(w => w.code === val)
  wardName.value = found ? found.name : ''
  rebuildFullAddress()
}

const rebuildFullAddress = () => {
  const parts = []
  if (streetAddress.value && streetAddress.value.trim()) {
    parts.push(streetAddress.value.trim())
  }
  if (wardName.value) {
    parts.push(wardName.value)
  }
  if (districtName.value) {
    parts.push(districtName.value)
  }
  if (provinceName.value) {
    parts.push(provinceName.value)
  }
  if (parts.length > 0) {
    form.address = parts.join(', ')
  }
}

const syncData = () => {
  if (authStore.user) {
    form.fullName = authStore.user.fullName || ''
    form.phone = authStore.user.phone || ''
    form.email = authStore.user.email || ''
    form.address = authStore.user.address || ''
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      syncData()
      loadProvinces()
      authStore.fetchCurrentUser().then(() => syncData())
    }
  },
  { immediate: true }
)

async function submitUpdateProfile() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.trim()
      if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
        ElMessage.warning('Số điện thoại không hợp lệ (từ 9 đến 11 chữ số)')
        return
      }
    }

    if (form.email && form.email.trim()) {
      const cleanEmail = form.email.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        ElMessage.warning('Địa chỉ email không đúng định dạng')
        return
      }
    }

    loading.value = true
    try {
      await authStore.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone ? form.phone.trim() : null,
        email: form.email ? form.email.trim() : null,
        address: form.address ? form.address.trim() : null
      })
      ElMessage.success('Cập nhật thông tin tài khoản thành công!')
      emit('update:modelValue', false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại!'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.user-meta-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 14px;

  .meta-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #0f172a;
    color: #ffffff;
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .meta-info {
    display: flex;
    flex-direction: column;

    .meta-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .meta-sub {
      font-size: 11.5px;
      color: #64748b;
    }
  }
}

.profile-dialog-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;

    .el-form-item__label {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      padding-bottom: 2px;
    }
  }
}

.address-builder-section {
  margin: 10px 0 6px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;

  .address-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .sec-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #0f172a;
    }

    .btn-toggle-address-mode {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      font-size: 10.5px;
      font-weight: 700;
      color: #2563eb;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;

      &:hover {
        background: #eff6ff;
        color: #1d4ed8;
      }
    }
  }

  .cascade-address-container {
    margin-bottom: 4px;

    .cascade-row-3col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
        gap: 4px;
      }
    }

    .cascade-item {
      margin-bottom: 8px !important;

      :deep(.el-select) {
        .el-input__wrapper {
          height: 32px;
        }
      }
    }
  }

  .full-addr-item {
    margin-bottom: 2px !important;
  }
}
</style>
