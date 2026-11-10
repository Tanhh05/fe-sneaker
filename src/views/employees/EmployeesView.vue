<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Nhân viên Cửa hàng</h2>
        <p class="page-subtitle">Quản lý hồ sơ nhân sự, chức vụ, ngày vào làm và liên kết tài khoản đăng nhập hệ thống</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm nhân viên
      </el-button>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã NV, họ tên, số điện thoại, email..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang làm việc (ACTIVE)" value="ACTIVE" />
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
          <el-empty description="Không tìm thấy nhân viên phù hợp" :image-size="84" />
        </template>
        <el-table-column label="Mã NV" width="110">
          <template #default="{ row }">
            <span class="code-badge">{{ row.employeeCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fullName" label="Họ và tên nhân viên" min-width="180" />
        <el-table-column prop="position" label="Chức vụ" width="160" />
        <el-table-column prop="phone" label="Số điện thoại" width="130" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column label="Tài khoản liên kết" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.username" type="warning" effect="plain">@{{ row.username }}</el-tag>
            <span v-else style="color: #94a3b8; font-size: 12px">Chưa liên kết</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày vào làm" width="120">
          <template #default="{ row }">{{ formatDate(row.hireDate) }}</template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ row.status === 'ACTIVE' ? 'Đang làm việc' : 'Ngừng HĐ' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="235" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openDetail(row)">Chi tiết</el-button>
            <el-button size="small" type="primary" plain @click="openEdit(row)">Sửa</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              size="small"
              type="danger"
              plain
              @click="handleToggleStatus(row, 'INACTIVE')"
            >
              Khóa
            </el-button>
            <el-button
              v-else
              size="small"
              type="success"
              plain
              @click="handleToggleStatus(row, 'ACTIVE')"
            >
              Mở
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
      :title="isEdit ? 'Cập nhật hồ sơ Nhân viên' : 'Thêm Nhân viên mới'"
      width="620px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="8">
            <el-form-item label="Mã nhân viên" prop="employeeCode">
              <el-input v-model="form.employeeCode" placeholder="VD: NV006" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="Họ và tên nhân viên" prop="fullName">
              <el-input v-model="form.fullName" placeholder="Nhập họ tên đầy đủ" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Chức vụ" prop="position">
              <el-input v-model="form.position" placeholder="VD: Nhân viên bán hàng / Cửa hàng trưởng" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ngày vào làm" prop="hireDate">
              <el-date-picker
                v-model="form.hireDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Số điện thoại" prop="phone">
              <el-input v-model="form.phone" placeholder="09xxxxxxxx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="staff@sneakerstore.vn" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Ngày sinh" prop="dateOfBirth">
              <el-date-picker
                v-model="form.dateOfBirth"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Giới tính" prop="gender">
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="Nam (MALE)" value="MALE" />
                <el-option label="Nữ (FEMALE)" value="FEMALE" />
                <el-option label="Khác (OTHER)" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="14">
            <el-form-item label="Liên kết tài khoản đăng nhập" prop="userId">
              <el-select v-model="form.userId" clearable placeholder="Chọn tài khoản User (Tùy chọn)" style="width: 100%">
                <el-option
                  v-for="u in users"
                  :key="u.id"
                  :label="`@${u.username} - ${u.fullName}`"
                  :value="u.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="ACTIVE (Đang làm việc)" value="ACTIVE" />
                <el-option label="INACTIVE (Ngừng hoạt động)" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Địa chỉ thường trú" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu nhân viên</el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Thông tin chi tiết Nhân viên" width="520px">
      <el-descriptions v-if="selectedEmployee" :column="1" border>
        <el-descriptions-item label="Mã nhân viên">{{ selectedEmployee.employeeCode }}</el-descriptions-item>
        <el-descriptions-item label="Họ và tên"><strong>{{ selectedEmployee.fullName }}</strong></el-descriptions-item>
        <el-descriptions-item label="Chức vụ">{{ selectedEmployee.position }}</el-descriptions-item>
        <el-descriptions-item label="Số điện thoại">{{ selectedEmployee.phone }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ selectedEmployee.email || '---' }}</el-descriptions-item>
        <el-descriptions-item label="Ngày sinh">{{ formatDate(selectedEmployee.dateOfBirth) }}</el-descriptions-item>
        <el-descriptions-item label="Ngày vào làm">{{ formatDate(selectedEmployee.hireDate) }}</el-descriptions-item>
        <el-descriptions-item label="Tài khoản liên kết">
          {{ selectedEmployee.username ? `@${selectedEmployee.username}` : 'Chưa liên kết' }}
        </el-descriptions-item>
        <el-descriptions-item label="Địa chỉ">{{ selectedEmployee.address || '---' }}</el-descriptions-item>
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
import { employeeService } from '@/services/employeeService'
import { userService } from '@/services/userService'
import { formatDate } from '@/utils/formatters'
import { useDebouncedWatch } from '@/composables/useDebounce'

const loading = ref(false)
const saving = ref(false)
const items = ref([])
const users = ref([])

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
const selectedEmployee = ref(null)

const form = reactive({
  employeeCode: '',
  fullName: '',
  dateOfBirth: '1999-05-10',
  gender: 'MALE',
  phone: '',
  email: '',
  address: '',
  position: 'Nhân viên bán hàng',
  hireDate: '2024-01-15',
  userId: null,
  status: 'ACTIVE'
})

const rules = {
  employeeCode: [{ required: true, message: 'Vui lòng nhập mã nhân viên', trigger: 'blur' }],
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }],
  position: [{ required: true, message: 'Vui lòng nhập chức vụ', trigger: 'blur' }],
  hireDate: [{ required: true, message: 'Vui lòng chọn ngày vào làm', trigger: 'change' }]
}

async function loadUsers() {
  const res = await userService.getAllUsers()
  users.value = res.data || []
}

async function loadData() {
  loading.value = true
  try {
    const res = await employeeService.getEmployees({
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
  form.employeeCode = `NV00${items.value.length + 1}`
  form.fullName = ''
  form.dateOfBirth = '1999-05-10'
  form.gender = 'MALE'
  form.phone = ''
  form.email = ''
  form.address = ''
  form.position = 'Nhân viên bán hàng'
  form.hireDate = new Date().toISOString().slice(0, 10)
  form.userId = null
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
  selectedEmployee.value = row
  detailVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await employeeService.updateEmployee(editingId.value, form)
        ElMessage.success('Cập nhật nhân viên thành công')
      } else {
        await employeeService.createEmployee(form)
        ElMessage.success('Thêm nhân viên mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

function handleToggleStatus(row, status) {
  const label = status === 'INACTIVE' ? 'ngừng hoạt động' : 'mở hoạt động lại'
  ElMessageBox.confirm(
    `Xác nhận ${label} cho nhân viên "${row.fullName}"?`,
    'Xác nhận trạng thái nhân viên',
    { type: 'warning' }
  ).then(async () => {
    await employeeService.updateEmployeeStatus(row.id, status)
    ElMessage.success(`Đã cập nhật trạng thái nhân viên ${row.fullName}`)
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadUsers()
  loadData()
})
</script>
