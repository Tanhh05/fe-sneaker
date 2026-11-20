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
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
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
        <el-table-column label="Ảnh" width="65" align="center">
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
        <el-table-column label="Mã SP" width="115" align="center">
          <template #default="{ row }">
            <span class="code-badge">{{ row.productCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="Tên sản phẩm Sneaker" min-width="170" />
        <el-table-column prop="brandName" label="Thương hiệu" width="110" />
        <el-table-column prop="categoryName" label="Danh mục" width="110" />
        <el-table-column prop="material" label="Chất liệu" min-width="130" show-overflow-tooltip />
        <el-table-column label="Giá nhập" width="115" align="right">
          <template #default="{ row }">{{ formatCurrency(row.importPrice) }}</template>
        </el-table-column>
        <el-table-column label="Giá bán" width="120" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="115" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="115" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <button class="action-btn" title="Xem chi tiết" @click="openDetail(row)">
                <el-icon><View /></el-icon>
              </button>
              <button v-if="canManageCatalog" class="action-btn" title="Chỉnh sửa" @click="openEdit(row)">
                <el-icon><Edit /></el-icon>
              </button>
              <el-dropdown
                v-if="canManageCatalog && row.status === 'ACTIVE'"
                trigger="click"
                @command="(cmd) => handleProductAction(cmd, row)"
              >
                <button class="action-btn action-more" title="Thao tác khác">
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      command="discontinue"
                      style="color: #ef4444"
                    >
                      ✕ Ngừng KD
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <button
                v-else-if="canManageCatalog"
                type="button"
                class="action-btn action-more is-disabled"
                disabled
                title="Sản phẩm đã ngừng kinh doanh"
              >
                <el-icon><MoreFilled /></el-icon>
              </button>
            </div>
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

    <!-- Product Detail & Variants Quick View Dialog -->
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
import { Plus, View, Edit, MoreFilled } from '@element-plus/icons-vue'
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
  router.push('/admin/products/create')
}

function openEdit(row) {
  router.push(`/admin/products/${row.id}/edit`)
}

async function openDetail(row) {
  const res = await productService.getProductById(row.id)
  selectedProduct.value = res.data
  detailVisible.value = true
}

function goToVariants() {
  detailVisible.value = false
  router.push('/admin/variants')
}

function handleProductAction(cmd, row) {
  if (cmd === 'discontinue') {
    handleDiscontinue(row)
  }
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
  width: 40px;
  height: 40px;
  border-radius: 0;
  object-fit: cover;
  border: 1px solid #e5e5e5;
  display: block;
  margin: 0 auto;
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #09090b;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
}
</style>
