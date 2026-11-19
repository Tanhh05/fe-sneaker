<template>
  <div class="product-form-page" v-loading="loadingPage">
    <!-- TOP STICKY ACTION BAR -->
    <div class="top-action-bar">
      <div class="bar-left">
        <button type="button" class="btn-back" @click="handleCancel">
          <el-icon><Back /></el-icon>
          <span>QUAY LẠI DANH SÁCH</span>
        </button>
        <div class="bar-divider"></div>
        <div class="bar-title-group">
          <div class="bar-badges">
            <span class="code-badge">{{ isEdit ? form.productCode || 'EDIT' : 'NEW CATALOG' }}</span>
            <span class="mode-tag">{{ isEdit ? 'CHẾ ĐỘ CẬP NHẬT' : 'KHỞI TẠO MỚI' }}</span>
          </div>
          <h2 class="bar-title">
            {{ isEdit ? `CHỈNH SỬA: ${form.productName || 'SẢN PHẨM'}` : 'THÊM MỚI SẢN PHẨM SNEAKER' }}
          </h2>
        </div>
      </div>

      <div class="bar-right">
        <button type="button" class="btn-ghost" @click="handleCancel">
          Hủy bỏ
        </button>
        <button
          v-if="isEdit"
          type="button"
          class="btn-secondary"
          @click="goToVariants"
          title="Quản lý các biến thể Size / Màu của sản phẩm này"
        >
          <el-icon><Grid /></el-icon>
          <span>Quản lý Biến thể SKU</span>
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="saving"
          @click="submitForm"
        >
          <el-icon v-if="!saving"><Check /></el-icon>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
          <span>{{ saving ? 'ĐANG LƯU...' : (isEdit ? 'LƯU CẬP NHẬT' : 'LƯU SẢN PHẨM') }}</span>
        </button>
      </div>
    </div>

    <!-- MAIN FORM BODY -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="product-detail-form"
      >
        <div class="layout-grid">
          <!-- CỘT TRÁI: LIVE SHOWCASE & FINANCIAL INTEL (360px - STICKY) -->
          <aside class="sidebar-showcase">
            <!-- 1. Live Sneaker Card -->
            <div class="showcase-card">
              <div class="showcase-card-header">
                <span class="header-label">XEM TRƯỚC SẢN PHẨM (LIVE PREVIEW)</span>
                <el-tag :type="form.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                  {{ form.status }}
                </el-tag>
              </div>

              <div class="showcase-media-box">
                <img
                  v-if="form.thumbnailUrl && !imgError"
                  :src="form.thumbnailUrl"
                  alt="Sneaker preview"
                  class="showcase-img"
                  @error="imgError = true"
                  @load="imgError = false"
                />
                <div v-else class="showcase-placeholder">
                  <el-icon :size="48" class="ph-icon"><Picture /></el-icon>
                  <span class="ph-title">CHƯA CÓ HÌNH ẢNH</span>
                  <span class="ph-desc">Dán URL ảnh hoặc chọn mẫu ảnh nhanh bên dưới</span>
                </div>
              </div>

              <div class="showcase-info">
                <div class="showcase-brand-row">
                  <span class="brand-pill">{{ getBrandName(form.brandId) }}</span>
                  <span class="dot-sep">&bull;</span>
                  <span class="cat-pill">{{ getCategoryName(form.categoryId) }}</span>
                </div>
                <h3 class="showcase-name" :title="form.productName">
                  {{ form.productName || 'Tên mẫu giày Sneaker...' }}
                </h3>
                <div class="showcase-price-box">
                  <div class="price-col">
                    <span class="price-label">GIÁ NIÊM YẾT</span>
                    <strong class="price-val">{{ formatCurrency(form.salePrice || 0) }}</strong>
                  </div>
                  <div class="code-col">
                    <span class="code-label">MÃ QUẢN LÝ</span>
                    <span class="code-val">{{ form.productCode || '---' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Image URL Input & Studio Presets -->
            <div class="presets-card">
              <div class="card-subtitle-row">
                <label class="card-sub-label">ẢNH ĐẠI DIỆN SẢN PHẨM</label>
                <button
                  v-if="form.thumbnailUrl"
                  type="button"
                  class="btn-clear-img"
                  @click="form.thumbnailUrl = ''; imgError = false"
                >
                  Xóa ảnh
                </button>
              </div>

              <el-input
                v-model="form.thumbnailUrl"
                placeholder="https://images.unsplash.com/..."
                clearable
                @input="imgError = false"
              >
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>

              <div class="presets-gallery">
                <span class="gallery-hint">Mẫu ảnh chụp studio có sẵn:</span>
                <div class="preset-thumbs">
                  <button
                    v-for="(p, idx) in sampleImages"
                    :key="idx"
                    type="button"
                    class="thumb-btn"
                    :class="{ active: form.thumbnailUrl === p.url }"
                    :title="p.name"
                    @click="applyPreset(p.url)"
                  >
                    <img :src="p.url" :alt="p.name" />
                    <span class="thumb-tag">{{ p.shortName }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. Financial Profit & Margin Intelligence Widget -->
            <div class="finance-intel-card" :class="{ warning: profit < 0 }">
              <div class="intel-header">
                <span class="intel-title">ĐỊNH LƯỢNG TÀI CHÍNH &amp; LỢI NHUẬN</span>
                <span class="intel-badge" :class="marginClass">{{ marginText }}</span>
              </div>
              <div class="intel-stats-row">
                <div class="stat-col">
                  <span class="stat-lbl">Lợi nhuận gộp/đôi</span>
                  <span class="stat-num" :class="{ negative: profit < 0 }">
                    {{ profit >= 0 ? '+' : '' }}{{ formatCurrency(profit) }}
                  </span>
                </div>
                <div class="stat-col align-right">
                  <span class="stat-lbl">Tỷ suất sinh lời</span>
                  <span class="stat-num highlight">{{ marginPercent }}</span>
                </div>
              </div>
              <div v-if="profit < 0" class="intel-alert">
                <el-icon><Warning /></el-icon>
                <span>Cảnh báo: Giá bán đang thấp hơn giá nhập hàng!</span>
              </div>
            </div>
          </aside>

          <!-- CỘT PHẢI: FORM DỮ LIỆU ĐẦY ĐỦ (MAIN CONTENT) -->
          <main class="main-fields-column">
            <!-- CARD 01: THÔNG TIN ĐỊNH DANH SẢN PHẨM -->
            <div class="form-block-card">
              <div class="block-badge">01. THÔNG TIN ĐỊNH DANH SẢN PHẨM</div>
              
              <el-row :gutter="16">
                <el-col :xs="24" :sm="8">
                  <el-form-item label="Mã sản phẩm (*)" prop="productCode">
                    <div class="code-action-wrap">
                      <el-input
                        v-model="form.productCode"
                        placeholder="VD: SP012"
                        class="mono-input"
                      />
                      <button
                        type="button"
                        class="btn-gen-code"
                        title="Tự động tạo mã ngẫu nhiên"
                        @click="autoGenerateCode"
                      >
                        <el-icon><Lightning /></el-icon>
                        <span>Tạo mã</span>
                      </button>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="16">
                  <el-form-item label="Tên sản phẩm Sneaker (*)" prop="productName">
                    <el-input
                      v-model="form.productName"
                      placeholder="VD: Nike Dunk Low Retro Panda Black White"
                      class="large-input"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Thương hiệu Sneaker (*)" prop="brandId">
                    <el-select
                      v-model="form.brandId"
                      placeholder="Chọn hãng giày"
                      style="width: 100%"
                      filterable
                    >
                      <el-option
                        v-for="b in brands"
                        :key="b.id"
                        :label="`${b.brandName} (${b.country || 'Global'})`"
                        :value="b.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Phân loại Danh mục (*)" prop="categoryId">
                    <el-select
                      v-model="form.categoryId"
                      placeholder="Chọn danh mục giày"
                      style="width: 100%"
                      filterable
                    >
                      <el-option
                        v-for="c in categories"
                        :key="c.id"
                        :label="c.categoryName"
                        :value="c.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- CARD 02: THIẾT LẬP ĐỊNH GIÁ TIÊU CHUẨN & TRẠNG THÁI -->
            <div class="form-block-card">
              <div class="block-badge">02. THIẾT LẬP ĐỊNH GIÁ &amp; KINH DOANH</div>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="8">
                  <el-form-item label="Giá nhập cơ sở (VNĐ) (*)" prop="importPrice">
                    <el-input-number
                      v-model="form.importPrice"
                      :min="0"
                      :step="50000"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="8">
                  <el-form-item label="Giá bán niêm yết (VNĐ) (*)" prop="salePrice">
                    <el-input-number
                      v-model="form.salePrice"
                      :min="0"
                      :step="50000"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="8">
                  <el-form-item label="Trạng thái kinh doanh (*)" prop="status">
                    <el-select v-model="form.status" style="width: 100%">
                      <el-option label="ACTIVE" value="ACTIVE" />
                      <el-option label="INACTIVE" value="INACTIVE" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- CARD 03: CHẤT LIỆU, CÔNG NGHỆ & MÔ TẢ CHI TIẾT -->
            <div class="form-block-card">
              <div class="block-badge">03. CHẤT LIỆU, CÔNG NGHỆ ĐỆM &amp; MÔ TẢ</div>

              <el-form-item label="Chất liệu cấu thành (Upper &amp; Sole)" prop="material">
                <el-input
                  v-model="form.material"
                  placeholder="VD: Da thật cao cấp kết hợp đế cao su đúc lưu hóa chống trơn trượt..."
                />
                <!-- Quick Material Chips -->
                <div class="chips-container">
                  <span class="chips-title">Thêm nhanh chất liệu:</span>
                  <button
                    v-for="chip in materialChips"
                    :key="chip"
                    type="button"
                    class="chip-tag-btn"
                    @click="appendMaterial(chip)"
                  >
                    + {{ chip }}
                  </button>
                </div>
              </el-form-item>

              <el-form-item label="Mô tả chi tiết câu chuyện sản phẩm" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  placeholder="Mô tả phom dáng, nguồn gốc thiết kế, công nghệ đế êm ái, hướng dẫn phối đồ và khuyến nghị chọn size..."
                />
              </el-form-item>
            </div>

            <!-- NẾU ĐANG EDIT: CARD 04 - DANH SÁCH BIẾN THỂ HIỆN CÓ CỦA SẢN PHẨM -->
            <div v-if="isEdit" class="form-block-card">
              <div class="block-badge">04. DANH SÁCH BIẾN THỂ SKU HIỆN CÓ ({{ (existingVariants || []).length }} BIẾN THỂ)</div>
              
              <div class="variants-section-header">
                <p class="variants-note">
                  Sản phẩm hiện đang có {{ existingVariants.length }} biến thể Size / Màu. Bạn có thể xem nhanh bảng bên dưới hoặc chuyển sang màn Biến thể để nhập kho &amp; thêm SKU mới.
                </p>
                <button type="button" class="btn-goto-variants" @click="goToVariants">
                  <el-icon><Right /></el-icon>
                  <span>Chuyển tới Quản lý Biến thể</span>
                </button>
              </div>

              <el-table :data="existingVariants" border stripe size="small" style="width: 100%">
                <template #empty>
                  <el-empty description="Sản phẩm chưa có biến thể Size/Màu nào. Hãy tạo biến thể sau khi lưu!" :image-size="70" />
                </template>
                <el-table-column prop="sku" label="Mã SKU" width="150">
                  <template #default="{ row }">
                    <span class="code-badge">{{ row.sku }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="sizeValue" label="Size EU" width="90" align="center" />
                <el-table-column label="Màu sắc" min-width="140">
                  <template #default="{ row }">
                    <span class="color-dot" :style="{ backgroundColor: row.hexCode || '#000000' }"></span>
                    <span>{{ row.colorName }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Giá nhập" width="120" align="right">
                  <template #default="{ row }">{{ formatCurrency(row.importPrice) }}</template>
                </el-table-column>
                <el-table-column label="Giá bán" width="120" align="right">
                  <template #default="{ row }">
                    <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="availableQuantity" label="SL sẵn có" width="95" align="center" />
              </el-table>
            </div>
          </main>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Back,
  Check,
  Loading,
  Grid,
  Right,
  Picture,
  Link,
  Warning,
  Lightning
} from '@element-plus/icons-vue'
import { productService } from '@/services/productService'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loadingPage = ref(false)
const saving = ref(false)
const imgError = ref(false)

const isEdit = computed(() => !!route.params.id)
const productId = computed(() => route.params.id)

const brands = ref([])
const categories = ref([])
const existingVariants = ref([])

const form = reactive({
  productCode: '',
  productName: '',
  brandId: null,
  categoryId: null,
  material: 'Da thật cao cấp kết hợp đế cao su đúc lưu hóa',
  description: '',
  thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  importPrice: 1800000,
  salePrice: 2950000,
  status: 'ACTIVE'
})

const rules = {
  productCode: [
    { required: true, message: 'Vui lòng nhập mã sản phẩm', trigger: 'blur' },
    { max: 30, message: 'Mã sản phẩm tối đa 30 ký tự', trigger: 'blur' }
  ],
  productName: [
    { required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' },
    { max: 200, message: 'Tên sản phẩm tối đa 200 ký tự', trigger: 'blur' }
  ],
  brandId: [{ required: true, message: 'Vui lòng chọn thương hiệu', trigger: 'change' }],
  categoryId: [{ required: true, message: 'Vui lòng chọn danh mục', trigger: 'change' }],
  importPrice: [{ required: true, message: 'Vui lòng nhập giá nhập cơ sở', trigger: 'blur' }],
  salePrice: [{ required: true, message: 'Vui lòng nhập giá bán niêm yết', trigger: 'blur' }]
}

// Preset Studio Images
const sampleImages = [
  {
    name: 'Nike Dunk Low Panda',
    shortName: 'Dunk Panda',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
  },
  {
    name: 'Air Jordan 1 High OG',
    shortName: 'Jordan 1',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600'
  },
  {
    name: 'New Balance 550 Retro',
    shortName: 'NB 550',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600'
  },
  {
    name: 'Adidas Ultraboost Light',
    shortName: 'Ultraboost',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600'
  }
]

// Material Quick Chips
const materialChips = [
  'Da thật cao cấp (Leather)',
  'Da lộn mềm mịn (Suede)',
  'Vải dệt thoáng khí Flyknit',
  'Bộ đệm khí Air Zoom',
  'Đế bọt trợ lực ZoomX',
  'Màng chống thấm nước GORE-TEX'
]

// Computed Financial Intelligence
const profit = computed(() => {
  const sale = Number(form.salePrice) || 0
  const cost = Number(form.importPrice) || 0
  return sale - cost
})

const marginPercent = computed(() => {
  const cost = Number(form.importPrice) || 0
  if (cost <= 0) return '0%'
  const p = profit.value
  const pct = (p / cost) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
})

const marginText = computed(() => {
  const cost = Number(form.importPrice) || 0
  if (cost <= 0) return 'CHƯA ĐỊNH GIÁ'
  const p = profit.value
  const pct = (p / cost) * 100
  if (pct < 0) return 'LỖ VỐN'
  if (pct < 20) return 'BIÊN ĐỘ THẤP'
  if (pct <= 60) return 'BIÊN ĐỘ TỐT'
  return 'LỢI NHUẬN CAO'
})

const marginClass = computed(() => {
  const cost = Number(form.importPrice) || 0
  if (cost <= 0) return 'neutral'
  const p = profit.value
  const pct = (p / cost) * 100
  if (pct < 0) return 'danger'
  if (pct < 20) return 'warning'
  return 'success'
})

function getBrandName(brandId) {
  if (!brandId) return 'SNEAKERHUB'
  const b = brands.value.find((item) => item.id === brandId)
  return b ? b.brandName : 'SNEAKER'
}

function getCategoryName(catId) {
  if (!catId) return 'ORIGINALS'
  const c = categories.value.find((item) => item.id === catId)
  return c ? c.categoryName : 'FOOTWEAR'
}

function applyPreset(url) {
  form.thumbnailUrl = url
  imgError.value = false
}

function appendMaterial(chip) {
  if (!form.material) {
    form.material = chip
  } else if (!form.material.includes(chip)) {
    form.material = `${form.material}, ${chip}`
  }
}

function autoGenerateCode() {
  const rand = Math.floor(100 + Math.random() * 900)
  form.productCode = `SP${rand}`
}

function handleCancel() {
  router.push('/products')
}

function goToVariants() {
  router.push('/variants')
}

async function loadInitialData() {
  loadingPage.value = true
  try {
    const [bRes, cRes] = await Promise.all([
      brandService.getAllBrands(),
      categoryService.getAllCategories()
    ])
    brands.value = bRes.data || []
    categories.value = cRes.data || []

    if (isEdit.value) {
      const pRes = await productService.getProductById(productId.value)
      const p = pRes.data
      form.productCode = p.productCode || ''
      form.productName = p.productName || ''
      form.brandId = p.brandId || null
      form.categoryId = p.categoryId || null
      form.material = p.material || ''
      form.description = p.description || ''
      form.thumbnailUrl = p.thumbnailUrl || ''
      form.importPrice = Number(p.importPrice) || 0
      form.salePrice = Number(p.salePrice) || 0
      form.status = p.status || 'ACTIVE'
      existingVariants.value = p.variants || []
    } else {
      autoGenerateCode()
      if (brands.value.length) form.brandId = brands.value[0].id
      if (categories.value.length) form.categoryId = categories.value[0].id
    }
  } catch (err) {
    ElMessage.error('Không thể tải thông tin sản phẩm hoặc danh mục')
  } finally {
    loadingPage.value = false
  }
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('Vui lòng kiểm tra lại các trường thông tin bắt buộc (*)')
      return
    }

    saving.value = true
    try {
      const payload = {
        ...form,
        imageUrls: form.thumbnailUrl ? [form.thumbnailUrl] : []
      }

      if (isEdit.value) {
        await productService.updateProduct(productId.value, payload)
        ElMessage.success('Cập nhật thông tin sản phẩm Sneaker thành công!')
      } else {
        await productService.createProduct(payload)
        ElMessage.success('Khởi tạo sản phẩm Sneaker mới thành công!')
      }

      router.push('/products')
    } catch (err) {
      // Error handled by api interceptor
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  loadInitialData()
})
</script>

<style scoped lang="scss">
.product-form-page {
  padding-bottom: 80px;
}

/* TOP STICKY ACTION BAR */
.top-action-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 2px solid #000000;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;

  .bar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .btn-back {
      background: #ffffff;
      border: 1px solid #000000;
      color: #000000;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 6px 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;
      font-family: var(--font-sans);

      &:hover {
        background: #000000;
        color: #ffffff;
      }
    }

    .bar-divider {
      width: 1px;
      height: 28px;
      background: #e2e8f0;
    }

    .bar-title-group {
      .bar-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 3px;

        .code-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .mode-tag {
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      }

      .bar-title {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.04em;
        margin: 0;
        color: #000000;
        text-transform: uppercase;
        line-height: 1.2;
      }
    }
  }

  .bar-right {
    display: flex;
    align-items: center;
    gap: 10px;

    .btn-ghost {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
    }

    .btn-secondary {
      background: #f8fafc;
      border: 1px solid #000000;
      color: #000000;
      font-size: 12px;
      font-weight: 800;
      padding: 8px 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;

      &:hover {
        background: #000000;
        color: #ffffff;
      }
    }

    .btn-primary {
      background: #000000;
      border: 1px solid #000000;
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 8px 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;

      &:hover:not(:disabled) {
        background: #262626;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
}

/* MAIN FORM CONTAINER */
.form-container {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 28px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 28px;
  align-items: start;
}

/* CỘT TRÁI (SHOWCASE) */
.sidebar-showcase {
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Live Showcase Card */
.showcase-card {
  background: #ffffff;
  border: 1px solid #000000;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.08);

  .showcase-card-header {
    background: #000000;
    color: #ffffff;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      font-family: var(--font-mono);
    }
  }

  .showcase-media-box {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #f1f5f9;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .showcase-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
      &:hover {
        transform: scale(1.04);
      }
    }

    .showcase-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;

      .ph-icon {
        color: #cbd5e1;
        margin-bottom: 8px;
      }

      .ph-title {
        font-size: 12px;
        font-weight: 800;
        color: #475569;
        letter-spacing: 0.06em;
      }

      .ph-desc {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 4px;
      }
    }
  }

  .showcase-info {
    padding: 14px 16px;
    border-top: 1px solid #e2e8f0;

    .showcase-brand-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 6px;

      .brand-pill {
        color: #0f172a;
      }
    }

    .showcase-name {
      font-size: 15px;
      font-weight: 800;
      margin: 0 0 12px;
      color: #0f172a;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .showcase-price-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed #e2e8f0;
      padding-top: 10px;

      .price-col {
        display: flex;
        flex-direction: column;

        .price-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .price-val {
          font-size: 16px;
          font-weight: 900;
          color: #000000;
          font-family: var(--font-mono);
        }
      }

      .code-col {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .code-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
        }

        .code-val {
          font-size: 12px;
          font-weight: 800;
          font-family: var(--font-mono);
          color: #334155;
        }
      }
    }
  }
}

/* Presets Card */
.presets-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 14px 16px;

  .card-subtitle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .card-sub-label {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .btn-clear-img {
      background: none;
      border: none;
      font-size: 10px;
      font-weight: 700;
      color: #ef4444;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .presets-gallery {
    margin-top: 12px;

    .gallery-hint {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
    }

    .preset-thumbs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;

      .thumb-btn {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 3px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 0;
        transition: all 0.15s ease;

        img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }

        .thumb-tag {
          font-size: 8px;
          font-weight: 700;
          color: #475569;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        &:hover,
        &.active {
          border-color: #000000;
          box-shadow: 0 0 0 1px #000000;
        }
      }
    }
  }
}

/* Financial Profit Intelligence Card */
.finance-intel-card {
  background: #0f172a;
  color: #ffffff;
  padding: 14px 16px;
  border: 1px solid #000000;

  &.warning {
    background: #450a0a;
    border-color: #ef4444;
  }

  .intel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 8px;

    .intel-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }

    .intel-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 0;
      text-transform: uppercase;

      &.success {
        background: #10b981;
        color: #ffffff;
      }
      &.warning {
        background: #f59e0b;
        color: #000000;
      }
      &.danger {
        background: #ef4444;
        color: #ffffff;
      }
      &.neutral {
        background: #475569;
        color: #ffffff;
      }
    }
  }

  .intel-stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .stat-col {
      display: flex;
      flex-direction: column;

      &.align-right {
        align-items: flex-end;
      }

      .stat-lbl {
        font-size: 10px;
        color: #94a3b8;
        margin-bottom: 2px;
      }

      .stat-num {
        font-size: 15px;
        font-weight: 900;
        font-family: var(--font-mono);
        color: #10b981;

        &.negative {
          color: #ef4444;
        }

        &.highlight {
          color: #38bdf8;
        }
      }
    }
  }

  .intel-alert {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 10px;
    color: #fca5a5;
    font-weight: 700;
  }
}

/* CỘT PHẢI (MAIN FIELDS) */
.main-fields-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-block-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 22px 24px 10px;
  position: relative;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.04);

  .block-badge {
    position: absolute;
    top: -10px;
    left: 18px;
    background: #000000;
    color: #ffffff;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.08em;
    padding: 2px 10px;
    text-transform: uppercase;
  }
}

.code-action-wrap {
  display: flex;
  align-items: center;
  gap: 8px;

  .btn-gen-code {
    background: #ffffff;
    border: 1px solid #000000;
    color: #000000;
    font-size: 11px;
    font-weight: 800;
    padding: 0 10px;
    height: 32px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    border-radius: 0;
    transition: all 0.12s ease;

    &:hover {
      background: #000000;
      color: #ffffff;
    }
  }
}

.chips-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  .chips-title {
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    margin-right: 2px;
  }

  .chip-tag-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    cursor: pointer;
    border-radius: 0;
    transition: all 0.12s ease;

    &:hover {
      background: #000000;
      border-color: #000000;
      color: #ffffff;
    }
  }
}

/* Variants Section in Edit Mode */
.variants-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;

  .variants-note {
    font-size: 12px;
    color: #64748b;
    margin: 0;
    max-width: 650px;
    line-height: 1.4;
  }

  .btn-goto-variants {
    background: #000000;
    border: 1px solid #000000;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 0;
    transition: all 0.12s ease;

    &:hover {
      background: #262626;
    }
  }
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  border: 1px solid #cbd5e1;
  vertical-align: middle;
}
</style>
