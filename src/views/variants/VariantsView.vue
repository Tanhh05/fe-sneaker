<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Biến thể Sản phẩm (SKU) &amp; Size / Màu sắc</h2>
        <p class="page-subtitle">Quản lý chi tiết từng SKU theo Size và Màu sắc (Ví dụ: AF1-39-W, AF1-40-W, AF1-41-B)</p>
      </div>
      <div v-if="canManageCatalog">
        <el-button v-if="activeTab === 'variants'" type="primary" @click="openCreateVariant">
          <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm biến thể SKU
        </el-button>
        <el-button v-else-if="activeTab === 'sizes'" type="primary" @click="sizeTabRef?.openCreateSize()">
          <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm Size giày
        </el-button>
        <el-button v-else type="primary" @click="colorTabRef?.openCreateColor()">
          <el-icon style="margin-right: 6px"><Plus /></el-icon> Thêm Màu sắc
        </el-button>
      </div>
    </div>

    <div class="table-card">
      <el-tabs v-model="activeTab">
        <!-- TAB 1: PRODUCT VARIANTS (SKU) -->
        <el-tab-pane label="Danh sách Biến thể (SKU)" name="variants">
          <el-row :gutter="12" style="margin-bottom: 16px">
            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="vFilters.keyword"
                placeholder="Tìm theo SKU hoặc tên giày (tự động lọc 350ms)..."
                clearable
                @keyup.enter="loadVariants"
              />
            </el-col>
            <el-col :xs="12" :sm="6" :md="6">
              <el-select v-model="vFilters.productId" placeholder="Lọc theo sản phẩm" clearable style="width: 100%" @change="loadVariants">
                <el-option v-for="p in products" :key="p.id" :label="`${p.productCode} - ${p.productName}`" :value="p.id" />
              </el-select>
            </el-col>
            <el-col :xs="12" :sm="5" :md="4">
              <el-select v-model="vFilters.sizeId" placeholder="Size EU" clearable style="width: 100%" @change="loadVariants">
                <el-option v-for="s in sizes" :key="s.id" :label="`Size ${s.sizeValue}`" :value="s.id" />
              </el-select>
            </el-col>
            <el-col :xs="12" :sm="5" :md="4">
              <el-select v-model="vFilters.colorId" placeholder="Màu sắc" clearable style="width: 100%" @change="loadVariants">
                <el-option v-for="c in colors" :key="c.id" :label="c.colorName" :value="c.id" />
              </el-select>
            </el-col>
            <el-col :xs="12" :sm="24" :md="4">
              <el-button type="primary" @click="loadVariants">Tìm SKU</el-button>
              <el-button @click="resetVariantFilter">Làm mới</el-button>
            </el-col>
          </el-row>

          <el-table :data="variants" v-loading="loading" stripe border style="width: 100%">
            <template #empty>
              <el-empty description="Không tìm thấy biến thể SKU phù hợp" :image-size="84" />
            </template>
            <el-table-column prop="id" label="ID" width="65" />
            <el-table-column label="Mã SKU" width="165">
              <template #default="{ row }">
                <span class="code-badge">{{ row.sku }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="Sản phẩm Sneaker" min-width="200" />
            <el-table-column prop="brandName" label="Hãng" width="120" />
            <el-table-column prop="sizeValue" label="Size EU" width="90" align="center">
              <template #default="{ row }">
                <el-tag effect="plain" type="warning"><strong>{{ row.sizeValue }}</strong></el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Màu sắc" width="160">
              <template #default="{ row }">
                <span class="color-dot" :style="{ backgroundColor: row.hexCode }"></span>
                {{ row.colorName }}
              </template>
            </el-table-column>
            <el-table-column label="Giá nhập" width="135" align="right">
              <template #default="{ row }">{{ formatCurrency(row.importPrice) }}</template>
            </el-table-column>
            <el-table-column label="Giá bán" width="140" align="right">
              <template #default="{ row }">
                <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="availableQuantity" label="SL sẵn có" width="105" align="center" />
            <el-table-column label="Trạng thái" width="115" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="canManageCatalog" label="Thao tác" width="110" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="openEditVariant(row)">Sửa</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="vPagination.page"
              v-model:page-size="vPagination.size"
              :total="vPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadVariants"
              @current-change="loadVariants"
            />
          </div>
        </el-tab-pane>

        <!-- TAB 2: SIZES (36 - 45) -->
        <el-tab-pane label="Quản lý Size giày (36 - 45)" name="sizes">
          <SizeManagerTab
            ref="sizeTabRef"
            :sizes="sizes"
            :can-manage-catalog="canManageCatalog"
            @saved="loadMeta"
          />
        </el-tab-pane>

        <!-- TAB 3: COLORS (HEX) -->
        <el-tab-pane label="Quản lý Màu sắc (HEX)" name="colors">
          <ColorManagerTab
            ref="colorTabRef"
            :colors="colors"
            :can-manage-catalog="canManageCatalog"
            @saved="loadMeta"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Modal Variant -->
    <el-dialog
      v-model="vDialogVisible"
      :title="isEditVariant ? 'Cập nhật biến thể sản phẩm (SKU)' : 'Thêm biến thể sản phẩm mới'"
      width="560px"
    >
      <el-form ref="vFormRef" :model="vForm" :rules="vRules" label-position="top">
        <el-form-item label="Sản phẩm Sneaker" prop="productId">
          <el-select v-model="vForm.productId" placeholder="Chọn sản phẩm" style="width: 100%" @change="autoSuggestSku">
            <el-option v-for="p in products" :key="p.id" :label="`${p.productCode} - ${p.productName}`" :value="p.id" />
          </el-select>
        </el-form-item>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Size giày" prop="sizeId">
              <el-select v-model="vForm.sizeId" placeholder="Chọn Size" style="width: 100%" @change="autoSuggestSku">
                <el-option v-for="s in sizes" :key="s.id" :label="`Size ${s.sizeValue}`" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Màu sắc" prop="colorId">
              <el-select v-model="vForm.colorId" placeholder="Chọn Màu sắc" style="width: 100%" @change="autoSuggestSku">
                <el-option v-for="c in colors" :key="c.id" :label="`${c.colorName} (${c.colorCode})`" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="14">
            <el-form-item label="Mã SKU riêng biệt" prop="sku">
              <el-input v-model="vForm.sku" placeholder="VD: AF1-43-W" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Số lượng có sẵn" prop="availableQuantity">
              <el-input-number v-model="vForm.availableQuantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="Giá nhập (VNĐ)" prop="importPrice">
              <el-input-number v-model="vForm.importPrice" :min="0" :step="50000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Giá bán (VNĐ)" prop="salePrice">
              <el-input-number v-model="vForm.salePrice" :min="0" :step="50000" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Trạng thái" prop="status">
          <el-select v-model="vForm.status" style="width: 100%">
            <el-option label="ACTIVE (Đang kinh doanh)" value="ACTIVE" />
            <el-option label="INACTIVE (Ngừng kinh doanh)" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="vDialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="submitVariant">Lưu biến thể</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { variantService } from '@/services/variantService'
import { productService } from '@/services/productService'
import { formatCurrency } from '@/utils/formatters'
import { usePermission } from '@/composables/usePermission'
import { useDebouncedWatch } from '@/composables/useDebounce'
import SizeManagerTab from './components/SizeManagerTab.vue'
import ColorManagerTab from './components/ColorManagerTab.vue'

const { canManageCatalog } = usePermission()
const activeTab = ref('variants')
const loading = ref(false)
const saving = ref(false)

const sizeTabRef = ref(null)
const colorTabRef = ref(null)

const products = ref([])
const sizes = ref([])
const colors = ref([])
const variants = ref([])

const vFilters = reactive({
  keyword: '',
  productId: null,
  sizeId: null,
  colorId: null
})
const vPagination = reactive({ page: 1, size: 10, total: 0 })

useDebouncedWatch(
  () => vFilters.keyword,
  () => {
    vPagination.page = 1
    loadVariants()
  },
  350
)

// Variant Form
const vDialogVisible = ref(false)
const isEditVariant = ref(false)
const editingVariantId = ref(null)
const vFormRef = ref(null)
const vForm = reactive({
  productId: null,
  sizeId: null,
  colorId: null,
  sku: '',
  importPrice: 1800000,
  salePrice: 2950000,
  availableQuantity: 10,
  status: 'ACTIVE'
})
const vRules = {
  productId: [{ required: true, message: 'Chọn sản phẩm', trigger: 'change' }],
  sizeId: [{ required: true, message: 'Chọn Size', trigger: 'change' }],
  colorId: [{ required: true, message: 'Chọn màu sắc', trigger: 'change' }],
  sku: [{ required: true, message: 'Nhập mã SKU', trigger: 'blur' }]
}

async function loadMeta() {
  const [pRes, sRes, cRes] = await Promise.all([
    productService.getAllProducts(),
    variantService.getSizes(),
    variantService.getColors()
  ])
  products.value = pRes.data || []
  sizes.value = sRes.data || []
  colors.value = cRes.data || []
}

async function loadVariants() {
  loading.value = true
  try {
    const res = await variantService.getVariants({
      keyword: vFilters.keyword,
      productId: vFilters.productId || undefined,
      sizeId: vFilters.sizeId || undefined,
      colorId: vFilters.colorId || undefined,
      page: vPagination.page - 1,
      size: vPagination.size
    })
    variants.value = res.data.content || []
    vPagination.total = res.data.totalElements || 0
  } finally {
    loading.value = false
  }
}

function resetVariantFilter() {
  vFilters.keyword = ''
  vFilters.productId = null
  vFilters.sizeId = null
  vFilters.colorId = null
  vPagination.page = 1
  loadVariants()
}

function autoSuggestSku() {
  if (isEditVariant.value) return
  const p = products.value.find((x) => x.id === vForm.productId)
  const s = sizes.value.find((x) => x.id === vForm.sizeId)
  const c = colors.value.find((x) => x.id === vForm.colorId)
  if (p) {
    vForm.importPrice = Number(p.importPrice)
    vForm.salePrice = Number(p.salePrice)
  }
  if (p && s && c) {
    vForm.sku = `${p.productCode}-${s.sizeValue}-${c.colorCode}`
  }
}

function openCreateVariant() {
  isEditVariant.value = false
  editingVariantId.value = null
  vForm.productId = products.value[0]?.id || null
  vForm.sizeId = sizes.value[0]?.id || null
  vForm.colorId = colors.value[0]?.id || null
  vForm.availableQuantity = 10
  vForm.status = 'ACTIVE'
  autoSuggestSku()
  vDialogVisible.value = true
}

function openEditVariant(row) {
  isEditVariant.value = true
  editingVariantId.value = row.id
  vForm.productId = row.productId
  vForm.sizeId = row.sizeId
  vForm.colorId = row.colorId
  vForm.sku = row.sku
  vForm.importPrice = Number(row.importPrice)
  vForm.salePrice = Number(row.salePrice)
  vForm.availableQuantity = row.availableQuantity
  vForm.status = row.status
  vDialogVisible.value = true
}

async function submitVariant() {
  if (!vFormRef.value) return
  await vFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEditVariant.value) {
        await variantService.updateVariant(editingVariantId.value, vForm)
        ElMessage.success('Cập nhật biến thể SKU thành công')
      } else {
        await variantService.createVariant(vForm)
        ElMessage.success('Thêm biến thể SKU mới thành công')
      }
      vDialogVisible.value = false
      loadVariants()
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  loadMeta()
  loadVariants()
})
</script>
