<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Khách hàng</h2>
        <p class="page-subtitle">Quản lý hồ sơ khách hàng thân thiết và tra cứu lịch sử mua giày tại cửa hàng</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm khách hàng
      </el-button>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã KH, họ tên, số điện thoại, email..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang hoạt động (ACTIVE)" value="ACTIVE" />
            <el-option label="Ngừng hoạt động (INACTIVE)" value="INACTIVE" />
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
          <el-empty description="Không tìm thấy khách hàng phù hợp" :image-size="84" />
        </template>
        <el-table-column label="Mã KH" width="110">
          <template #default="{ row }">
            <span class="code-badge">{{ row.customerCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fullName" label="Họ và tên khách hàng" min-width="190" />
        <el-table-column prop="phone" label="Số điện thoại" width="135" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column label="Giới tính" width="100" align="center">
          <template #default="{ row }">
            {{ row.gender === 'FEMALE' ? 'Nữ' : row.gender === 'MALE' ? 'Nam' : 'Khác' }}
          </template>
        </el-table-column>
        <el-table-column label="Ngày sinh" width="115">
          <template #default="{ row }">{{ formatDate(row.dateOfBirth) }}</template>
        </el-table-column>
        <el-table-column prop="address" label="Địa chỉ" min-width="200" show-overflow-tooltip />
        <el-table-column label="Ngày tạo" width="150">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="warning" plain @click="openHistory(row)">
              Lịch sử mua
            </el-button>
            <el-button size="small" type="primary" plain @click="openEdit(row)">
              Sửa
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
      :title="isEdit ? 'Cập nhật thông tin Khách hàng' : 'Thêm Khách hàng mới'"
      width="560px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="10">
            <el-form-item label="Mã khách hàng (Tự sinh nếu để trống)" prop="customerCode">
              <el-input v-model="form.customerCode" placeholder="VD: KH007" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="Họ và tên khách hàng (*)" prop="fullName">
              <el-input v-model="form.fullName" placeholder="Nhập họ tên đầy đủ" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Số điện thoại (*)" prop="phone">
              <el-input v-model="form.phone" placeholder="09xxxxxxxx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="customer@gmail.com" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="8">
            <el-form-item label="Giới tính" prop="gender">
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="Nam (MALE)" value="MALE" />
                <el-option label="Nữ (FEMALE)" value="FEMALE" />
                <el-option label="Khác (OTHER)" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Ngày sinh" prop="dateOfBirth">
              <el-date-picker
                v-model="form.dateOfBirth"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Chọn ngày sinh"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="ACTIVE" value="ACTIVE" />
                <el-option label="INACTIVE" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Địa chỉ liên hệ" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu khách hàng</el-button>
      </template>
    </el-dialog>

    <!-- Purchase History Dialog -->
    <CustomerHistoryDialog
      v-model="historyVisible"
      :customer="selectedCustomer"
      :orders="customerOrders"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { customerService } from '@/services/customerService'
import { orderService } from '@/services/orderService'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { useDebouncedWatch } from '@/composables/useDebounce'
import CustomerHistoryDialog from './components/CustomerHistoryDialog.vue'

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

const historyVisible = ref(false)
const selectedCustomer = ref(null)
const customerOrders = ref([])

const form = reactive({
  customerCode: '',
  fullName: '',
  phone: '',
  email: '',
  gender: 'MALE',
  dateOfBirth: null,
  address: '',
  status: 'ACTIVE'
})

const rules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên khách hàng', trigger: 'blur' }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await customerService.getCustomers({
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
  form.customerCode = ''
  form.fullName = ''
  form.phone = ''
  form.email = ''
  form.gender = 'MALE'
  form.dateOfBirth = '1998-06-15'
  form.address = ''
  form.status = 'ACTIVE'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

async function openHistory(row) {
  selectedCustomer.value = row
  const res = await orderService.getOrdersByCustomer(row.id)
  customerOrders.value = res.data || []
  historyVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await customerService.updateCustomer(editingId.value, form)
        ElMessage.success('Cập nhật khách hàng thành công')
      } else {
        await customerService.createCustomer(form)
        ElMessage.success('Thêm khách hàng mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
