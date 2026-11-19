<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? 'CẬP NHẬT SẢN PHẨM SNEAKER' : 'THÊM MỚI SẢN PHẨM SNEAKER'"
    width="960px"
    class="product-form-dialog"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="dialog-header-banner">
      <div class="banner-title-wrap">
        <span class="code-badge">{{ isEdit ? form.productCode || 'EDIT' : 'NEW CATALOG ITEM' }}</span>
        <h3 class="banner-title">
          {{ isEdit ? 'CHỈNH SỬA THÔNG TIN SẢN PHẨM' : 'KHỞI TẠO MẪU GIÀY SNEAKER MỚI' }}
        </h3>
      </div>
      <p class="banner-subtitle">
        Thiết lập định danh sản phẩm, giá bán tiêu chuẩn, ảnh mẫu đại diện và sẵn sàng cho quản lý biến thể SKU.
      </p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="product-modern-form">
      <div class="form-grid-layout">
        <!-- CỘT TRÁI: LIVE SHOWCASE & TÍNH TOÁN TÀI CHÍNH (340px) -->
        <div class="showcase-column">
          <!-- Live Preview Card -->
          <div class="preview-card">
            <div class="preview-header">
              <span class="preview-label">LIVE PREVIEW</span>
              <el-tag :type="form.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                {{ form.status === 'ACTIVE' ? 'ĐANG KINH DOANH' : 'TẠM NGỪNG' }}
              </el-tag>
            </div>

            <div class="preview-media-box">
              <img
                v-if="form.thumbnailUrl && !imgError"
                :src="form.thumbnailUrl"
                alt="preview"
                class="preview-img"
                @error="imgError = true"
                @load="imgError = false"
              />
              <div v-else class="preview-placeholder">
                <el-icon :size="42" class="placeholder-icon"><Picture /></el-icon>
                <span class="placeholder-text">CHƯA CÓ HÌNH ẢNH</span>
                <span class="placeholder-sub">Nhập URL ảnh hoặc chọn mẫu bên dưới</span>
              </div>
            </div>

            <div class="preview-meta">
              <div class="preview-brand">
                {{ getBrandName(form.brandId) }} &bull; {{ getCategoryName(form.categoryId) }}
              </div>
              <h4 class="preview-name" :title="form.productName || 'Tên sản phẩm Sneaker'">
                {{ form.productName || 'Tên mẫu giày Sneaker...' }}
              </h4>
              <div class="preview-price-row">
                <span class="preview-code">{{ form.productCode || 'MÃ-SP' }}</span>
                <span class="preview-price">{{ formatCurrency(form.salePrice || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- File Upload to MinIO & Image Input -->
          <div class="media-input-box">
            <div class="field-title-row">
              <div style="display: flex; align-items: center; gap: 6px;">
                <label class="field-label">Ảnh đại diện sản phẩm</label>
                <el-tag v-if="isMinioUrl" size="small" type="success" effect="dark" style="font-size: 9px; height: 18px; padding: 0 4px;">MINIO</el-tag>
              </div>
              <button
                v-if="form.thumbnailUrl"
                type="button"
                class="text-action-btn"
                @click="clearImage"
              >
                Xóa ảnh
              </button>
            </div>

            <!-- Upload Dropzone -->
            <div
              class="dialog-upload-box"
              :class="{ 'is-dragover': isDragOver, 'is-uploading': uploadingImage }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDropFile"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileInputChange"
              />
              <div v-if="uploadingImage" style="padding: 6px 0; text-align: center;">
                <el-icon class="is-loading" :size="20"><Loading /></el-icon>
                <span style="font-size: 11px; font-weight: bold; margin-left: 6px;">Đang lưu ảnh vào MinIO...</span>
              </div>
              <div v-else style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <el-icon :size="18"><UploadFilled /></el-icon>
                <span style="font-size: 11px; font-weight: 700;">CHỌN ẢNH TỪ MÁY HOẶC KÉO THẢ VÀO ĐÂY</span>
              </div>
            </div>

            <el-input
              v-model="form.thumbnailUrl"
              placeholder="http://localhost:9000/sneaker-products/..."
              clearable
              size="small"
              @input="imgError = false"
            >
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>

            <!-- Gợi ý ảnh mẫu thực tế -->
            <div class="image-presets-wrap">
              <span class="presets-label">Gợi ý mẫu ảnh đẹp:</span>
              <div class="preset-items">
                <button
                  v-for="(p, idx) in sampleImages"
                  :key="idx"
                  type="button"
                  class="preset-thumb-btn"
                  :class="{ active: form.thumbnailUrl === p.url }"
                  :title="p.name"
                  @click="applyPresetImage(p.url)"
                >
                  <img :src="p.url" :alt="p.name" />
                  <span class="preset-tag">{{ p.shortName }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Financial Profit & Margin Intelligence Widget -->
          <div class="profit-intelligence-card" :class="{ warning: profit < 0 }">
            <div class="intel-header">
              <span class="intel-title">LỢI NHUẬN &amp; TỶ SUẤT DỰ KIẾN</span>
              <span class="intel-badge" :class="marginClass">{{ marginText }}</span>
            </div>
            <div class="intel-body">
              <div class="intel-stat">
                <span class="stat-label">Lợi nhuận gộp/đôi</span>
                <span class="stat-value" :class="{ negative: profit < 0 }">
                  {{ profit >= 0 ? '+' : '' }}{{ formatCurrency(profit) }}
                </span>
              </div>
              <div class="intel-stat">
                <span class="stat-label">Tỷ suất sinh lời</span>
                <span class="stat-value highlight">{{ marginPercent }}</span>
              </div>
            </div>
            <div v-if="profit < 0" class="intel-warning-note">
              <el-icon><Warning /></el-icon>
              <span>Cảnh báo: Giá bán đang thấp hơn giá nhập hàng!</span>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: FORM NHẬP LIỆU CHI TIẾT (560px) -->
        <div class="fields-column">
          <!-- Section 1: Định danh sản phẩm -->
          <div class="form-section-card">
            <div class="section-badge">01. ĐỊNH DANH SẢN PHẨM</div>
            
            <el-row :gutter="14">
              <el-col :span="10">
                <el-form-item label="Mã sản phẩm (*)" prop="productCode">
                  <div class="code-input-group">
                    <el-input
                      v-model="form.productCode"
                      placeholder="VD: SP012"
                      style="font-family: var(--font-mono)"
                    />
                    <button
                      type="button"
                      class="btn-gen-code"
                      title="Sinh mã ngẫu nhiên"
                      @click="autoGenerateCode"
                    >
                      <el-icon><Lightning /></el-icon>
                    </button>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item label="Tên sản phẩm Sneaker (*)" prop="productName">
                  <el-input
                    v-model="form.productName"
                    placeholder="VD: Nike Dunk Low Retro Panda"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="Thương hiệu (*)" prop="brandId">
                  <el-select
                    v-model="form.brandId"
                    placeholder="Chọn thương hiệu Sneaker"
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
              <el-col :span="12">
                <el-form-item label="Danh mục (*)" prop="categoryId">
                  <el-select
                    v-model="form.categoryId"
                    placeholder="Chọn phân loại danh mục"
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

          <!-- Section 2: Thiết lập Định giá & Trạng thái -->
          <div class="form-section-card">
            <div class="section-badge">02. THIẾT LẬP ĐỊNH GIÁ &amp; KINH DOANH</div>

            <el-row :gutter="14">
              <el-col :span="8">
                <el-form-item label="Giá nhập cơ sở (VNĐ)" prop="importPrice">
                  <el-input-number
                    v-model="form.importPrice"
                    :min="0"
                    :step="50000"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Giá niêm yết bán (VNĐ)" prop="salePrice">
                  <el-input-number
                    v-model="form.salePrice"
                    :min="0"
                    :step="50000"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Trạng thái kinh doanh" prop="status">
                  <el-select v-model="form.status" style="width: 100%">
                    <el-option label="Đang kinh doanh" value="ACTIVE" />
                    <el-option label="Tạm ngừng KD" value="INACTIVE" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Section 3: Chất liệu & Mô tả chi tiết -->
          <div class="form-section-card">
            <div class="section-badge">03. CHẤT LIỆU &amp; CÔNG NGHỆ ĐỆM</div>

            <el-form-item label="Chất liệu cấu thành" prop="material">
              <el-input
                v-model="form.material"
                placeholder="VD: Da thật cao cấp kết hợp đế cao su lưu hóa..."
              />
              <!-- Quick Material Chips -->
              <div class="material-chips-wrap">
                <span class="chips-label">Thêm nhanh chất liệu:</span>
                <button
                  v-for="chip in materialChips"
                  :key="chip"
                  type="button"
                  class="material-chip-btn"
                  @click="appendMaterial(chip)"
                >
                  + {{ chip }}
                </button>
              </div>
            </el-form-item>

            <el-form-item label="Mô tả chi tiết sản phẩm" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="Mô tả câu chuyện thiết kế, phối màu, công nghệ đế, hướng dẫn chọn size..."
              />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="form-footer-bar">
        <div class="footer-left-info">
          <span class="footer-hint">* Lưu ý: Sau khi lưu sản phẩm, bạn có thể tạo các biến thể Size / Màu trong chi tiết.</span>
        </div>
        <div class="footer-buttons">
          <el-button @click="$emit('update:modelValue', false)">Hủy bỏ</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            <el-icon style="margin-right: 6px"><Check /></el-icon>
            {{ isEdit ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm mới' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Link, Warning, Lightning, Check, UploadFilled, Loading } from '@element-plus/icons-vue'
import { formatCurrency } from '@/utils/formatters'
import { fileService } from '@/services/fileService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  editingId: {
    type: [Number, String],
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  brands: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const imgError = ref(false)

// MinIO upload state
const fileInputRef = ref(null)
const uploadingImage = ref(false)
const isDragOver = ref(false)

const isMinioUrl = computed(() => {
  const url = form.thumbnailUrl || ''
  return url.includes(':9000') || url.includes('sneaker-products') || url.includes('/api/files')
})

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
  uploadingImage.value = true
  try {
    const res = await fileService.uploadImage(file)
    form.thumbnailUrl = res.url
    imgError.value = false
    ElMessage.success(`Đã lưu ảnh "${file.name}" vào MinIO thành công!`)
  } catch (err) {
    ElMessage.error('Không thể tải ảnh lên MinIO')
  } finally {
    uploadingImage.value = false
  }
}

function clearImage() {
  form.thumbnailUrl = ''
  imgError.value = false
}

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
  importPrice: [{ required: true, message: 'Vui lòng nhập giá nhập', trigger: 'blur' }],
  salePrice: [{ required: true, message: 'Vui lòng nhập giá bán', trigger: 'blur' }]
}

// Preset Images for Quick Preview
const sampleImages = [
  {
    name: 'Nike Dunk Low Panda',
    shortName: 'Dunk Panda',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
  },
  {
    name: 'Air Jordan 1 High',
    shortName: 'Jordan 1',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600'
  },
  {
    name: 'New Balance 550 Retro',
    shortName: 'NB 550',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600'
  },
  {
    name: 'Adidas Ultraboost',
    shortName: 'Ultraboost',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600'
  }
]

// Quick Material Chips
const materialChips = [
  'Da thật cao cấp (Leather)',
  'Da lộn mịn (Suede)',
  'Vải dệt thoáng khí Flyknit',
  'Bộ đệm khí Air Zoom',
  'Đế bọt trợ lực ZoomX',
  'Vải chống thấm GORE-TEX'
]

// Watch for initialData
watch(
  () => props.initialData,
  (val) => {
    if (val && Object.keys(val).length) {
      form.productCode = val.productCode || ''
      form.productName = val.productName || ''
      form.brandId = val.brandId || null
      form.categoryId = val.categoryId || null
      form.material = val.material || ''
      form.description = val.description || ''
      form.thumbnailUrl = val.thumbnailUrl || ''
      form.importPrice = Number(val.importPrice) || 0
      form.salePrice = Number(val.salePrice) || 0
      form.status = val.status || 'ACTIVE'
      imgError.value = false
    }
  },
  { immediate: true, deep: true }
)

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
  const b = props.brands.find((item) => item.id === brandId)
  return b ? b.brandName : 'SNEAKER'
}

function getCategoryName(catId) {
  if (!catId) return 'ORIGINALS'
  const c = props.categories.find((item) => item.id === catId)
  return c ? c.categoryName : 'FOOTWEAR'
}

function applyPresetImage(url) {
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

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('submit', { ...form })
  })
}
</script>

<style scoped lang="scss">
.product-form-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 24px;
    border-bottom: 2px solid #000000;
    margin-right: 0;
  }
  :deep(.el-dialog__body) {
    padding: 20px 24px 10px;
    background: #fafafa;
  }
  :deep(.el-dialog__footer) {
    padding: 14px 24px;
    border-top: 1px solid #e5e5e5;
    background: #ffffff;
  }
}

/* Header Banner */
.dialog-header-banner {
  background: #ffffff;
  border: 1px solid #000000;
  padding: 14px 18px;
  margin-bottom: 18px;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.08);

  .banner-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;

    .code-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .banner-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.04em;
      margin: 0;
      color: #000000;
      text-transform: uppercase;
    }
  }

  .banner-subtitle {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
}

/* Grid Layout: 340px Left / 1fr Right */
.form-grid-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}

/* LEFT COLUMN */
.showcase-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Live Preview Card */
.preview-card {
  background: #ffffff;
  border: 1px solid #000000;
  overflow: hidden;

  .preview-header {
    background: #000000;
    color: #ffffff;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .preview-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      font-family: var(--font-mono);
    }
  }

  .preview-media-box {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #f1f5f9;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.03);
      }
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      text-align: center;
      color: #94a3b8;

      .placeholder-icon {
        margin-bottom: 8px;
        color: #cbd5e1;
      }

      .placeholder-text {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: #64748b;
      }

      .placeholder-sub {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 2px;
      }
    }
  }

  .preview-meta {
    padding: 12px 14px;
    border-top: 1px solid #e2e8f0;

    .preview-brand {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .preview-name {
      font-size: 14px;
      font-weight: 800;
      margin: 0 0 10px;
      color: #0f172a;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .preview-price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed #e2e8f0;
      padding-top: 8px;

      .preview-code {
        font-size: 11px;
        font-weight: 800;
        font-family: var(--font-mono);
        color: #334155;
      }

      .preview-price {
        font-size: 14px;
        font-weight: 900;
        color: #000000;
        font-family: var(--font-mono);
      }
    }
  }
}

/* Media Input Box */
.media-input-box {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 12px;

  .field-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    .field-label {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }

    .text-action-btn {
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

  .dialog-upload-box {
    border: 1.5px dashed #000000;
    background: #f8fafc;
    padding: 10px 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #f1f5f9;
    }

    &.is-dragover {
      background: #e2e8f0;
      border-style: solid;
    }
  }

  .image-presets-wrap {
    margin-top: 10px;

    .presets-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
    }

    .preset-items {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;

      .preset-thumb-btn {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 2px;
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

        .preset-tag {
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

/* Profit & Margin Intelligence Widget */
.profit-intelligence-card {
  background: #0f172a;
  color: #ffffff;
  padding: 12px 14px;
  border: 1px solid #000000;

  &.warning {
    background: #450a0a;
    border-color: #ef4444;
  }

  .intel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 6px;

    .intel-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }

    .intel-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
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

  .intel-body {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .intel-stat {
      display: flex;
      flex-direction: column;

      .stat-label {
        font-size: 10px;
        color: #94a3b8;
        margin-bottom: 2px;
      }

      .stat-value {
        font-size: 14px;
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

  .intel-warning-note {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 10px;
    color: #fca5a5;
    font-weight: 700;
  }
}

/* RIGHT COLUMN */
.fields-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-section-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 16px 18px 6px;
  position: relative;

  .section-badge {
    position: absolute;
    top: -9px;
    left: 14px;
    background: #000000;
    color: #ffffff;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 1px 8px;
    text-transform: uppercase;
  }
}

.code-input-group {
  display: flex;
  align-items: center;
  gap: 6px;

  .btn-gen-code {
    width: 32px;
    height: 32px;
    background: #ffffff;
    border: 1px solid #000000;
    color: #000000;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.12s ease;
    border-radius: 0;

    &:hover {
      background: #000000;
      color: #ffffff;
    }
  }
}

/* Material Chips */
.material-chips-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  .chips-label {
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    margin-right: 2px;
  }

  .material-chip-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
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

/* Footer Bar */
.form-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .footer-left-info {
    .footer-hint {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
