<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Danh mục Giày Sneaker</h2>
        <p class="page-subtitle">Phân loại dòng sản phẩm (Running, Basketball, Lifestyle, Training, Skateboarding...)</p>
      </div>
      <el-button v-if="canManageCatalog" type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm danh mục
      </el-button>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="10">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã hoặc tên danh mục..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="6">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang hoạt động (ACTIVE)" value="ACTIVE" />
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
          <el-empty description="Không tìm thấy danh mục phù hợp" :image-size="84" />
        </template>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="Mã danh mục" width="150">
          <template #default="{ row }">
            <span class="code-badge">{{ row.categoryCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="Tên danh mục" width="210" />
        <el-table-column prop="description" label="Mô tả" min-width="260" />
        <el-table-column label="Ngày cập nhật" width="165">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="145" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="canManageCatalog" label="Thao tác" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">Sửa</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">Xóa</el-button>
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
      :title="isEdit ? 'Sửa danh mục giày' : 'Thêm danh mục giày mới'"
      width="480px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Mã danh mục" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="VD: CAT-TENNIS" />
        </el-form-item>
        <el-form-item label="Tên danh mục" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="VD: Tennis / Pickleball" />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Mô tả đặc điểm dòng giày..." />
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="ACTIVE (Đang hoạt động)" value="ACTIVE" />
            <el-option label="INACTIVE (Ngừng hoạt động)" value="INACTIVE" />
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
import { categoryService } from '@/services/categoryService'
import { formatDateTime } from '@/utils/formatters'
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
  categoryCode: '',
  categoryName: '',
  description: '',
  status: 'ACTIVE'
})

const rules = {
  categoryCode: [{ required: true, message: 'Vui lòng nhập mã danh mục', trigger: 'blur' }],
  categoryName: [{ required: true, message: 'Vui lòng nhập tên danh mục', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await categoryService.getCategories({
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
  form.categoryCode = ''
  form.categoryName = ''
  form.description = ''
  form.status = 'ACTIVE'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.categoryCode = row.categoryCode
  form.categoryName = row.categoryName
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
        await categoryService.updateCategory(editingId.value, form)
        ElMessage.success('Cập nhật danh mục thành công')
      } else {
        await categoryService.createCategory(form)
        ElMessage.success('Thêm danh mục mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa danh mục "${row.categoryName}"? (Chỉ xóa được nếu chưa có sản phẩm liên quan)`,
    'Xác nhận xóa danh mục',
    { type: 'warning' }
  ).then(async () => {
    await categoryService.deleteCategory(row.id)
    ElMessage.success('Đã xóa danh mục thành công')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
