<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Tài khoản &amp; Phân quyền</h2>
        <p class="page-subtitle">Quản lý tài khoản đăng nhập, gán vai trò ADMIN / MANAGER / STAFF và khóa/mở khóa tài khoản</p>
      </div>
      <el-button v-if="canManageUsers" type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm tài khoản mới
      </el-button>
    </div>

    <!-- Role Info Cards -->
    <div class="role-cards">
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-header">
          <el-tag :type="role.roleCode === 'ADMIN' ? 'danger' : role.roleCode === 'MANAGER' ? 'warning' : 'primary'" effect="dark">
            {{ role.roleCode }}
          </el-tag>
          <span class="role-name">{{ role.roleName }}</span>
        </div>
        <p class="role-desc">{{ role.description }}</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo username, họ tên, email..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang hoạt động (ACTIVE)" value="ACTIVE" />
            <el-option label="Đã khóa (LOCKED)" value="LOCKED" />
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
          <el-empty description="Không tìm thấy tài khoản phù hợp" :image-size="84" />
        </template>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="Username" min-width="140">
          <template #default="{ row }">
            <span class="code-badge">@{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fullName" label="Họ và tên" min-width="180" />
        <el-table-column prop="email" label="Email" min-width="190" />
        <el-table-column prop="phone" label="Số điện thoại" width="135" />
        <el-table-column label="Vai trò" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="r in row.roles"
              :key="r"
              :type="r === 'ADMIN' ? 'danger' : r === 'MANAGER' ? 'warning' : 'primary'"
              size="small"
              style="margin-right: 4px"
            >
              {{ r }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Đăng nhập gần nhất" width="160">
          <template #default="{ row }">{{ formatDateTime(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="135" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : row.status === 'LOCKED' ? 'danger' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="canManageUsers" label="Thao tác" width="190" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">Sửa</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              size="small"
              type="danger"
              plain
              :disabled="row.username === 'admin'"
              @click="handleToggleStatus(row, 'LOCKED')"
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
              Mở khóa
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

    <!-- Dialog Create / Edit -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Cập nhật tài khoản & phân quyền' : 'Thêm tài khoản mới'"
      width="520px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Tên đăng nhập (Username)" prop="username">
              <el-input v-model="form.username" :disabled="isEdit" placeholder="VD: staff03" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="isEdit ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo'" :prop="isEdit ? '' : 'password'">
              <el-input v-model="form.password" type="password" show-password placeholder="Ít nhất 6 ký tự" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Họ và tên" prop="fullName">
          <el-input v-model="form.fullName" placeholder="Nhập họ tên người dùng" />
        </el-form-item>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="example@sneakerstore.vn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại" prop="phone">
              <el-input v-model="form.phone" placeholder="090xxxxxxx" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="14">
            <el-form-item label="Vai trò phân quyền" prop="roles">
              <el-checkbox-group v-model="form.roles">
                <el-checkbox label="ADMIN">ADMIN</el-checkbox>
                <el-checkbox label="MANAGER">MANAGER</el-checkbox>
                <el-checkbox label="STAFF">STAFF</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="ACTIVE" value="ACTIVE" />
                <el-option label="LOCKED" value="LOCKED" />
                <el-option label="INACTIVE" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu tài khoản</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { userService } from '@/services/userService'
import { formatDateTime } from '@/utils/formatters'
import { usePermission } from '@/composables/usePermission'
import { useDebouncedWatch } from '@/composables/useDebounce'

const { canManageUsers } = usePermission()
const loading = ref(false)
const saving = ref(false)
const items = ref([])
const roles = ref([])

const filters = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

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

const form = reactive({
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
  roles: ['STAFF']
})

const rules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên', trigger: 'blur' }],
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  roles: [{ type: 'array', required: true, min: 1, message: 'Chọn ít nhất 1 vai trò', trigger: 'change' }]
}

async function loadRoles() {
  const res = await userService.getRoles()
  roles.value = res.data || []
}

async function loadData() {
  loading.value = true
  try {
    const res = await userService.getUsers({
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
  form.username = ''
  form.password = '123456'
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.status = 'ACTIVE'
  form.roles = ['STAFF']
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.username = row.username
  form.password = ''
  form.fullName = row.fullName
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.status = row.status
  form.roles = [...(row.roles || ['STAFF'])]
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await userService.updateUser(editingId.value, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          status: form.status,
          newPassword: form.password || null,
          roles: form.roles
        })
        ElMessage.success('Cập nhật tài khoản thành công')
      } else {
        await userService.createUser({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          status: form.status,
          roles: form.roles
        })
        ElMessage.success('Tạo tài khoản mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

function handleToggleStatus(row, targetStatus) {
  const actionLabel = targetStatus === 'LOCKED' ? 'khóa' : 'mở khóa'
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn ${actionLabel} tài khoản "${row.username}"?`,
    'Xác nhận trạng thái tài khoản',
    { type: 'warning' }
  ).then(async () => {
    await userService.updateUserStatus(row.id, targetStatus)
    ElMessage.success(`Đã ${actionLabel} tài khoản ${row.username}`)
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadRoles()
  loadData()
})
</script>

<style scoped lang="scss">
.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  .role-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 14px 18px;
    .role-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
      .role-name {
        font-weight: 700;
        font-size: 14px;
        color: #0f172a;
      }
    }
    .role-desc {
      font-size: 12.5px;
      color: #64748b;
    }
  }
}
</style>

