<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Nhà cung cấp</h2>
        <p class="page-subtitle">Quản lý đối tác phân phối giày Sneaker chính hãng, thông tin liên hệ và mã số thuế</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm nhà cung cấp
      </el-button>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã, tên NCC, người liên hệ, SĐT..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái hợp tác" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang hợp tác (ACTIVE)" value="ACTIVE" />
            <el-option label="Ngừng hợp tác (INACTIVE)" value="INACTIVE" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="8">
          <el-button type="primary" @click="loadData">Tìm kiếm</el-button>
          <el-button @click="resetFilter">Làm mới</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Table -->
    <div class="table-card" v-loading="loading">
      <el-table :data="items" stripe border style="width: 100%">
        <template #empty>
          <el-empty description="Không tìm thấy nhà cung cấp phù hợp" :image-size="84" />
        </template>
        <el-table-column label="Mã NCC" width="120">
          <template #default="{ row }">
            <span class="code-badge">{{ row.supplierCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="Tên nhà cung cấp" min-width="230" />
        <el-table-column prop="contactPerson" label="Người liên hệ" width="160" />
        <el-table-column prop="phone" label="Số điện thoại" width="135" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="taxCode" label="Mã số thuế" width="130" />
        <el-table-column label="Trạng thái" width="145" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? 'Đang hợp tác' : 'Ngừng hợp tác' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="230" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openDetail(row)">Chi tiết</el-button>
            <el-button size="small" type="primary" plain @click="openEdit(row)">Sửa</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              size="small"
              type="danger"
              plain
              @click="handleDeactivate(row)"
            >
              Ngừng HT
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- Modal Add / Edit -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'"
      width="560px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="10">
            <el-form-item label="Mã nhà cung cấp" prop="supplierCode">
              <el-input v-model="form.supplierCode" placeholder="VD: NCC004" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="Mã số thuế" prop="taxCode">
              <el-input v-model="form.taxCode" placeholder="VD: 0312345678" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Tên công ty / Nhà cung cấp" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="Nhập tên pháp nhân nhà cung cấp" />
        </el-form-item>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Người liên hệ" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="Họ tên đại diện" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại" prop="phone">
              <el-input v-model="form.phone" placeholder="028xxxxxxx / 090xxxxxxx" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="14">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="contact@supplier.vn" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="ACTIVE (Đang hợp tác)" value="ACTIVE" />
                <el-option label="INACTIVE (Ngừng hợp tác)" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Địa chỉ trụ sở / kho" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu nhà cung cấp</el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Thông tin chi tiết Nhà cung cấp" width="520px">
      <el-descriptions v-if="selectedSupplier" :column="1" border>
        <el-descriptions-item label="Mã nhà cung cấp">{{ selectedSupplier.supplierCode }}</el-descriptions-item>
        <el-descriptions-item label="Tên nhà cung cấp"><strong>{{ selectedSupplier.supplierName }}</strong></el-descriptions-item>
        <el-descriptions-item label="Người liên hệ">{{ selectedSupplier.contactPerson || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Số điện thoại">{{ selectedSupplier.phone }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ selectedSupplier.email || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Mã số thuế">{{ selectedSupplier.taxCode || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Địa chỉ">{{ selectedSupplier.address || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Trạng thái">{{ selectedSupplier.status }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { supplierService } from '@/services/supplierService'
import { useDebouncedWatch } from '@/composables/useDebounce'

const loading = ref(false)
const saving = ref(false)
const items = ref([])

const filters = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

useDebouncedWatch(
  () => filters.keyword,
  () => {
    pagination.page = 1
    loadData()
  },
  350
)

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const detailVisible = ref(false)
const selectedSupplier = ref(null)

const form = reactive({
  supplierCode: '',
  supplierName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  status: 'ACTIVE'
})

const rules = {
  supplierCode: [{ required: true, message: 'Vui lòng nhập mã nhà cung cấp', trigger: 'blur' }],
  supplierName: [{ required: true, message: 'Vui lòng nhập tên nhà cung cấp', trigger: 'blur' }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await supplierService.getSuppliers({
      keyword: filters.keyword,
      status: filters.status,
      page: pagination.page - 1,
      size: pagination.size
    })
    items.value = res.data.content || []
    pagination.total = res.data.totalElements || 0
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.keyword = ''
  filters.status = ''
  pagination.page = 1
  loadData()
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.supplierCode = `NCC00${items.value.length + 1}`
  form.supplierName = ''
  form.contactPerson = ''
  form.phone = ''
  form.email = ''
  form.address = ''
  form.taxCode = ''
  form.status = 'ACTIVE'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

function openDetail(row) {
  selectedSupplier.value = row
  detailVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await supplierService.updateSupplier(editingId.value, form)
        ElMessage.success('Cập nhật nhà cung cấp thành công')
      } else {
        await supplierService.createSupplier(form)
        ElMessage.success('Thêm nhà cung cấp mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

function handleDeactivate(row) {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn ngừng hợp tác với nhà cung cấp "${row.supplierName}"?`,
    'Xác nhận ngừng hợp tác',
    { type: 'warning' }
  ).then(async () => {
    await supplierService.deactivateSupplier(row.id)
    ElMessage.success('Đã chuyển trạng thái sang Ngừng hợp tác')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
