<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Sản phẩm Giày Sneaker</h2>
        <p class="page-subtitle">Quản lý thông tin mẫu giày, giá nhập/bán tiêu chuẩn và danh sách biến thể theo SKU</p>
      </div>
      <el-button v-if="canManageCatalog" type="primary" @click="openCreate">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm sản phẩm mới
      </el-button>
    </div>

    <!-- Filters -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="8" :md="7">
          <el-input
            v-model="filters.keyword"
            placeholder="Tìm theo mã hoặc tên sản phẩm (tự động lọc 350ms)..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="5" :md="5">
          <el-select v-model="filters.brandId" placeholder="Thương hiệu" clearable style="width: 100%" @change="loadData">
            <el-option v-for="b in brands" :key="b.id" :label="b.brandName" :value="b.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="5" :md="5">
          <el-select v-model="filters.categoryId" placeholder="Danh mục" clearable style="width: 100%" @change="loadData">
            <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Đang kinh doanh (ACTIVE)" value="ACTIVE" />
            <el-option label="Ngừng kinh doanh (INACTIVE)" value="INACTIVE" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="24" :md="3">
          <el-button type="primary" @click="loadData">Lọc</el-button>
          <el-button @click="resetFilter">Xóa</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Data Table -->
    <div class="table-card" v-loading="loading">
      <el-table :data="items" stripe border style="width: 100%">
        <template #empty>
          <el-empty description="Không tìm thấy sản phẩm phù hợp" :image-size="84" />
        </template>
        <el-table-column label="Ảnh" width="80" align="center">
          <template #default="{ row }">
            <img
              v-if="row.thumbnailUrl"
              :src="row.thumbnailUrl"
              alt="shoe"
              class="product-thumb"
            />
            <div v-else class="product-thumb placeholder">SNK</div>
          </template>
        </el-table-column>
        <el-table-column label="Mã SP" width="110">
          <template #default="{ row }">
            <span class="code-badge">{{ row.productCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="Tên sản phẩm Sneaker" min-width="210" />
        <el-table-column prop="brandName" label="Thương hiệu" width="135" />
        <el-table-column prop="categoryName" label="Danh mục" width="135" />
        <el-table-column prop="material" label="Chất liệu" min-width="160" show-overflow-tooltip />
        <el-table-column label="Giá nhập" width="140" align="right">
          <template #default="{ row }">{{ formatCurrency(row.importPrice) }}</template>
        </el-table-column>
        <el-table-column label="Giá bán" width="145" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="145" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? 'Đang kinh doanh' : 'Ngừng KD' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openDetail(row)">Chi tiết</el-button>
            <el-button v-if="canManageCatalog" size="small" type="primary" plain @click="openEdit(row)">
              Sửa
            </el-button>
            <el-button
              v-if="canManageCatalog && row.status === 'ACTIVE'"
              size="small"
              type="danger"
              plain
              @click="handleDiscontinue(row)"
            >
              Ngừng KD
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

    <!-- Modal Add / Edit Product -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Cập nhật sản phẩm Sneaker' : 'Thêm sản phẩm Sneaker mới'"
      width="680px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="8">
            <el-form-item label="Mã sản phẩm" prop="productCode">
              <el-input v-model="form.productCode" placeholder="VD: SP011" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="Tên sản phẩm Sneaker" prop="productName">
              <el-input v-model="form.productName" placeholder="VD: Nike Dunk Low Panda" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Thương hiệu" prop="brandId">
              <el-select v-model="form.brandId" placeholder="Chọn thương hiệu" style="width: 100%">
                <el-option v-for="b in brands" :key="b.id" :label="b.brandName" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Danh mục" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="Chọn danh mục" style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Giá nhập cơ sở (VNĐ)" prop="importPrice">
              <el-input-number v-model="form.importPrice" :min="0" :step="50000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Giá bán niêm yết (VNĐ)" prop="salePrice">
              <el-input-number v-model="form.salePrice" :min="0" :step="50000" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="16">
            <el-form-item label="Chất liệu" prop="material">
              <el-input v-model="form.material" placeholder="VD: Da thật cao cấp kết hợp đế cao su Air" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Trạng thái kinh doanh" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="Đang kinh doanh (ACTIVE)" value="ACTIVE" />
                <el-option label="Ngừng kinh doanh (INACTIVE)" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="URL Hình ảnh đại diện" prop="thumbnailUrl">
          <el-input v-model="form.thumbnailUrl" placeholder="https://images.unsplash.com/..." />
        </el-form-item>

        <el-form-item label="Mô tả chi tiết" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Mô tả phom dáng, công nghệ đệm, phối màu..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">Lưu sản phẩm</el-button>
      </template>
    </el-dialog>

    <!-- Product Detail & Variants Dialog -->
    <ProductDetailDialog
      v-model="detailVisible"
      :product="selectedProduct"
      @manage-variants="goToVariants"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { productService } from '@/services/productService'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { formatCurrency } from '@/utils/formatters'
import { usePermission } from '@/composables/usePermission'
import { useDebouncedWatch } from '@/composables/useDebounce'
import ProductDetailDialog from './components/ProductDetailDialog.vue'

const router = useRouter()
const { canManageCatalog } = usePermission()

const loading = ref(false)
const saving = ref(false)
const items = ref([])
const brands = ref([])
const categories = ref([])

const filters = reactive({
  keyword: '',
  brandId: null,
  categoryId: null,
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
  productCode: '',
  productName: '',
  brandId: null,
  categoryId: null,
  material: '',
  description: '',
  thumbnailUrl: '',
  importPrice: 1800000,
  salePrice: 2950000,
  status: 'ACTIVE'
})

const rules = {
  productCode: [{ required: true, message: 'Vui lòng nhập mã sản phẩm', trigger: 'blur' }],
  productName: [{ required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' }],
  brandId: [{ required: true, message: 'Vui lòng chọn thương hiệu', trigger: 'change' }],
  categoryId: [{ required: true, message: 'Vui lòng chọn danh mục', trigger: 'change' }],
  importPrice: [{ required: true, message: 'Vui lòng nhập giá nhập', trigger: 'blur' }],
  salePrice: [{ required: true, message: 'Vui lòng nhập giá bán', trigger: 'blur' }]
}

const detailVisible = ref(false)
const selectedProduct = ref(null)

async function loadMeta() {
  const [bRes, cRes] = await Promise.all([
    brandService.getAllBrands(),
    categoryService.getAllCategories()
  ])
  brands.value = bRes.data || []
  categories.value = cRes.data || []
}

async function loadData() {
  loading.value = true
  try {
    const res = await productService.getProducts({
      keyword: filters.keyword,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined,
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
  filters.brandId = null
  filters.categoryId = null
  filters.status = ''
  pagination.page = 1
  loadData()
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.productCode = `SP0${items.value.length + 11}`
  form.productName = ''
  form.brandId = brands.value[0]?.id || null
  form.categoryId = categories.value[0]?.id || null
  form.material = 'Da thật kết hợp đế cao su lưu hóa'
  form.description = ''
  form.thumbnailUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
  form.importPrice = 1800000
  form.salePrice = 2900000
  form.status = 'ACTIVE'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.productCode = row.productCode
  form.productName = row.productName
  form.brandId = row.brandId
  form.categoryId = row.categoryId
  form.material = row.material || ''
  form.description = row.description || ''
  form.thumbnailUrl = row.thumbnailUrl || ''
  form.importPrice = Number(row.importPrice)
  form.salePrice = Number(row.salePrice)
  form.status = row.status
  dialogVisible.value = true
}

async function openDetail(row) {
  const res = await productService.getProductById(row.id)
  selectedProduct.value = res.data
  detailVisible.value = true
}

function goToVariants() {
  detailVisible.value = false
  router.push('/variants')
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = {
        ...form,
        imageUrls: form.thumbnailUrl ? [form.thumbnailUrl] : []
      }
      if (isEdit.value) {
        await productService.updateProduct(editingId.value, payload)
        ElMessage.success('Cập nhật sản phẩm thành công')
      } else {
        await productService.createProduct(payload)
        ElMessage.success('Thêm sản phẩm mới thành công')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

function handleDiscontinue(row) {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn ngừng kinh doanh sản phẩm "${row.productName}"?`,
    'Xác nhận ngừng kinh doanh',
    { type: 'warning' }
  ).then(async () => {
    await productService.discontinueProduct(row.id)
    ElMessage.success('Đã chuyển sản phẩm sang trạng thái Ngừng kinh doanh')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadMeta()
  loadData()
})
</script>

<style scoped lang="scss">
.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    color: #f97316;
    font-size: 11px;
    font-weight: 800;
  }
}
</style>
