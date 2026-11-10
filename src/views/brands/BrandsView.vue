<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Thương hiệu Sneaker</h2>
        <p class="page-subtitle">Quản lý các hãng giày quốc tế (Nike, Adidas, Puma, Converse, New Balance, Vans, Jordan, Asics...)</p>
      </div>
      <el-button v-if="canManageCatalog" type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm thương hiệu
      </el-button>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã hoặc tên thương hiệu..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang sử dụng (ACTIVE)" value="ACTIVE" />
            <el-option label="Ngừng sử dụng (INACTIVE)" value="INACTIVE" />
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
          <el-empty description="Không tìm thấy thương hiệu phù hợp" :image-size="84" />
        </template>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="Mã hãng" width="145">
          <template #default="{ row }">
            <span class="code-badge">{{ row.brandCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="brandName" label="Tên thương hiệu" width="180" />
        <el-table-column prop="country" label="Quốc gia" width="140" />
        <el-table-column prop="description" label="Mô tả" min-width="260" />
        <el-table-column label="Trạng thái" width="145" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? 'Đang sử dụng' : 'Ngừng sử dụng' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="canManageCatalog" label="Thao tác" width="195" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">Sửa</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              size="small"
              type="danger"
              plain
              @click="handleDeactivate(row)"
            >
              Ngừng SD
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

    <!-- Modal -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Sửa thương hiệu Sneaker' : 'Thêm thương hiệu mới'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Mã thương hiệu" prop="brandCode">
              <el-input v-model="form.brandCode" placeholder="VD: BRD-REEBOK" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Quốc gia xuất xứ" prop="country">
              <el-input v-model="form.country" placeholder="VD: USA, Germany, Japan" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Tên thương hiệu" prop="brandName">
          <el-input v-model="form.brandName" placeholder="VD: Reebok" />
        </el-form-item>
        <el-form-item label="Logo URL" prop="logoUrl">
          <el-input v-model="form.logoUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="ACTIVE (Đang sử dụng)" value="ACTIVE" />
            <el-option label="INACTIVE (Ngừng sử dụng)" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { brandService } from '@/services/brandService'
import { usePermission } from '@/composables/usePermission'
import { useDebouncedWatch } from '@/composables/useDebounce'

const { canManageCatalog } = usePermission()
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

const form = reactive({
  brandCode: '',
  brandName: '',
  country: 'USA',
  logoUrl: '',
  description: '',
  status: 'ACTIVE'
})

const rules = {
  brandCode: [{ required: true, message: 'Vui lòng nhập mã thương hiệu', trigger: 'blur' }],
  brandName: [{ required: true, message: 'Vui lòng nhập tên thương hiệu', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await brandService.getBrands({
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
  form.brandCode = ''
  form.brandName = ''
  form.country = 'USA'
  form.logoUrl = ''
  form.description = ''
  form.status = 'ACTIVE'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.brandCode = row.brandCode
  form.brandName = row.brandName
  form.country = row.country || ''
  form.logoUrl = row.logoUrl || ''
  form.description = row.description || ''
  form.status = row.status
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await brandService.updateBrand(editingId.value, form)
        ElMessage.success('Cập nhật thương hiệu thành công')
      } else {
        await brandService.createBrand(form)
        ElMessage.success('Thêm thương hiệu mới thành công')
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
    `Bạn có chắc chắn muốn ngừng sử dụng thương hiệu "${row.brandName}"?`,
    'Xác nhận ngừng sử dụng',
    { type: 'warning' }
  ).then(async () => {
    await brandService.deactivateBrand(row.id)
    ElMessage.success('Đã ngừng sử dụng thương hiệu')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
