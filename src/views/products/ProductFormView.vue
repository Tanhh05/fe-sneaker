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

            <!-- 2. Image Upload from Computer to MinIO & Studio Presets -->
            <div class="presets-card">
              <div class="card-subtitle-row">
                <div class="sub-label-with-badge">
                  <label class="card-sub-label">ẢNH ĐẠI DIỆN SẢN PHẨM</label>
                  <span v-if="isMinioUrl" class="minio-cloud-pill">MINIO S3 STORAGE</span>
                </div>
                <button
                  v-if="form.thumbnailUrl"
                  type="button"
                  class="btn-clear-img"
                  @click="clearImage"
                >
                  Xóa ảnh
                </button>
              </div>

              <!-- Sleek Brutalist File Upload Dropzone -->
              <div
                class="upload-dropzone"
                :class="{ 'is-dragover': isDragOver, 'is-uploading': uploadingImage }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="handleDropFile"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  class="file-input-hidden"
                  @change="handleFileInputChange"
                />

                <div v-if="uploadingImage" class="uploading-state">
                  <el-icon class="is-loading" :size="30"><Loading /></el-icon>
                  <span class="uploading-text">ĐANG TẢI ẢNH LÊN MINIO S3...</span>
                  <span class="uploading-sub">Tự động khởi tạo &amp; lưu trữ đám mây</span>
                </div>

                <div v-else class="dropzone-idle">
                  <div class="dropzone-icon-box">
                    <el-icon :size="26"><UploadFilled /></el-icon>
                  </div>
                  <div class="dropzone-texts">
                    <strong class="dz-main">CHỌN ẢNH TỪ TỆP MÁY TÍNH</strong>
                    <span class="dz-hint">Kéo thả ảnh vào đây hoặc click để duyệt tệp</span>
                  </div>
                  <button type="button" class="btn-browse-file" @click.stop="triggerFileInput">
                    DUYỆT TỆP
                  </button>
                </div>
              </div>

              <!-- Uploaded MinIO Information Box -->
              <div v-if="form.thumbnailUrl" class="uploaded-minio-box">
                <div class="minio-path-row">
                  <span class="minio-lbl">ĐƯỜNG DẪN ẢNH HIỂN THỊ:</span>
                  <span class="minio-url-display" :title="form.thumbnailUrl">{{ form.thumbnailUrl }}</span>
                </div>
                <div class="minio-actions-bar">
                  <button type="button" class="btn-minio-action" @click="copyImageUrl" title="Sao chép đường dẫn">
                    <el-icon><DocumentCopy /></el-icon>
                    <span>Sao chép link</span>
                  </button>
                  <button type="button" class="btn-minio-action" @click="openImageInNewTab" title="Xem ảnh gốc">
                    <el-icon><View /></el-icon>
                    <span>Xem ảnh gốc</span>
                  </button>
                </div>
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
  Lightning,
  UploadFilled,
  DocumentCopy,
  View
} from '@element-plus/icons-vue'
import { productService } from '@/services/productService'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { fileService } from '@/services/fileService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loadingPage = ref(false)
const saving = ref(false)
const imgError = ref(false)

// MinIO Image Upload state
const fileInputRef = ref(null)
const uploadingImage = ref(false)
const isDragOver = ref(false)
const uploadedFileInfo = ref(null)

const isMinioUrl = computed(() => {
  const url = form.thumbnailUrl || ''
  return url.includes(':9000') || url.includes('sneaker-products') || url.includes('/api/files')
})

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

// Material Quick Chips
const materialChips = [
  'Da thật cao cấp (Leather)',
  'Da lộn mềm mịn (Suede)',
  'Vải dệt thoáng khí Flyknit',
  'Bộ đệm khí Air Zoom',
  'Đế bọt trợ lực ZoomX',
  'Màng chống thấm nước GORE-TEX'
]

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

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileInputChange(e) {
  const files = e.target?.files
  if (files && files.length > 0) {
    uploadSelectedFile(files[0])
  }
  if (e.target) e.target.value = ''
}

function handleDropFile(e) {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    uploadSelectedFile(files[0])
  }
}

async function uploadSelectedFile(file) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG)!')
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('Kích thước ảnh vượt quá giới hạn 20MB!')
    return
  }

  uploadingImage.value = true
  try {
    const res = await fileService.uploadImage(file)
    form.thumbnailUrl = res.url
    uploadedFileInfo.value = {
      fileName: res.fileName,
      originalName: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    }
    imgError.value = false
    ElMessage.success(`Đã lưu ảnh "${file.name}" vào MinIO thành công!`)
  } catch (err) {
    const msg = err.response?.data?.message || 'Không thể tải ảnh lên MinIO. Vui lòng kiểm tra lại kết nối!'
    ElMessage.error(msg)
  } finally {
    uploadingImage.value = false
  }
}

function copyImageUrl() {
  if (!form.thumbnailUrl) return
  navigator.clipboard.writeText(form.thumbnailUrl)
  ElMessage.success('Đã sao chép đường dẫn ảnh vào bộ nhớ tạm!')
}

function openImageInNewTab() {
  if (!form.thumbnailUrl) return
  window.open(form.thumbnailUrl, '_blank')
}

function clearImage() {
  form.thumbnailUrl = ''
  uploadedFileInfo.value = null
  imgError.value = false
  ElMessage.info('Đã xóa hình ảnh')
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
    margin-bottom: 10px;

    .sub-label-with-badge {
      display: flex;
      align-items: center;
      gap: 8px;

      .card-sub-label {
        font-size: 11px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .minio-cloud-pill {
        background: #0f172a;
        color: #38bdf8;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.06em;
        padding: 2px 6px;
        border-radius: 2px;
      }
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

  .file-input-hidden {
    display: none;
  }

  .upload-dropzone {
    border: 1.5px dashed #000000;
    background: #f8fafc;
    padding: 14px 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 12px;

    &:hover {
      background: #f1f5f9;
      border-color: #000000;
    }

    &.is-dragover {
      background: #e2e8f0;
      border-color: #000000;
      border-style: solid;
      transform: scale(1.01);
    }

    &.is-uploading {
      cursor: wait;
      background: #f8fafc;
    }

    .uploading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      text-align: center;

      .uploading-text {
        font-size: 11px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.05em;
        margin-top: 8px;
      }

      .uploading-sub {
        font-size: 10px;
        color: #64748b;
        margin-top: 2px;
      }
    }

    .dropzone-idle {
      display: flex;
      align-items: center;
      gap: 12px;

      .dropzone-icon-box {
        width: 42px;
        height: 42px;
        background: #000000;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .dropzone-texts {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;

        .dz-main {
          font-size: 11px;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.03em;
        }

        .dz-hint {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
          line-height: 1.3;
        }
      }

      .btn-browse-file {
        background: #ffffff;
        border: 1px solid #000000;
        color: #000000;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 5px 9px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.12s ease;

        &:hover {
          background: #000000;
          color: #ffffff;
        }
      }
    }
  }

  .uploaded-minio-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #000000;
    padding: 10px 12px;
    margin-bottom: 12px;

    .minio-path-row {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 8px;

      .minio-lbl {
        font-size: 9px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.05em;
      }

      .minio-url-display {
        font-size: 11px;
        font-family: var(--font-mono);
        color: #0f172a;
        word-break: break-all;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 4px 8px;
        line-height: 1.35;
      }
    }

    .minio-actions-bar {
      display: flex;
      gap: 8px;

      .btn-minio-action {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        transition: all 0.12s ease;

        &:hover {
          background: #000000;
          border-color: #000000;
          color: #ffffff;
        }
      }
    }
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
