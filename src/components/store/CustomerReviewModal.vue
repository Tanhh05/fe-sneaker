<template>
  <el-dialog
    v-model="visible"
    title="ĐÁNH GIÁ SẢN PHẨM"
    width="520px"
    class="customer-review-dialog"
    :close-on-click-modal="false"
  >
    <div class="review-modal-body">
      <!-- Product Summary Header -->
      <div v-if="product" class="review-product-header">
        <img
          v-if="product.thumbnailUrl"
          :src="product.thumbnailUrl"
          alt="product"
          class="review-prod-img"
        />
        <div v-else class="review-prod-img placeholder">SNK</div>
        <div class="review-prod-info">
          <div class="review-prod-name">{{ product.productName }}</div>
          <div class="review-prod-sub">Đơn hàng #{{ orderCode }}</div>
        </div>
      </div>

      <!-- Rating Stars -->
      <div class="form-group rating-group">
        <label class="group-label">1. Đánh giá chất lượng sản phẩm (*):</label>
        <div class="stars-interactive-row">
          <el-rate
            v-model="rating"
            :max="5"
            size="large"
            show-score
            score-template="{value} sao"
          />
          <span class="rating-vibe-text">{{ ratingLabel }}</span>
        </div>
      </div>

      <!-- Fit Feedback -->
      <div class="form-group fit-group">
        <label class="group-label">2. Độ vừa vặn của giày (Fit Feedback):</label>
        <el-radio-group v-model="fitFeedback" class="fit-radio-group">
          <el-radio-button label="TRUE_TO_SIZE">Chuẩn size (True to size)</el-radio-button>
          <el-radio-button label="HALF_SIZE_UP">Hơi chật (Tăng 0.5 size)</el-radio-button>
          <el-radio-button label="HALF_SIZE_DOWN">Hơi rộng (Lùi 0.5 size)</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Comment text -->
      <div class="form-group comment-group">
        <label class="group-label">3. Nhận xét chi tiết của bạn (*):</label>
        <el-input
          v-model="comment"
          type="textarea"
          :rows="4"
          placeholder="Hãy chia sẻ cảm nhận về độ êm chân, chất liệu da, độ hoàn thiện hoặc gợi ý phối đồ để giúp cộng đồng sneakerhead có thêm thông tin nhé..."
          maxlength="500"
          show-word-limit
        />
      </div>

      <!-- On-feet Photo Upload -->
      <div class="form-group photo-group">
        <label class="group-label">4. Ảnh On-feet mang giày thực tế (Khuyến khích):</label>
        <div class="photo-upload-row">
          <div
            v-for="(url, idx) in photoUrls"
            :key="idx"
            class="uploaded-thumb-box"
          >
            <img :src="url" alt="on-feet" />
            <button type="button" class="btn-remove-photo" @click="photoUrls.splice(idx, 1)">×</button>
          </div>

          <div v-if="photoUrls.length < 3" class="upload-trigger-btn" @click="triggerFileInput">
            <span v-if="uploading" class="upload-loading">Đang tải...</span>
            <template v-else>
              <span class="cam-icon">📸</span>
              <span class="upload-text">+ Thêm ảnh</span>
            </template>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>
        <p class="photo-hint">Chụp ảnh giày khi mang lên chân (On-feet) để nhận ngay huy hiệu "Người mua xác thực"!</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">Hủy</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          class="btn-submit-review"
          @click="submitReview"
        >
          GỬI ĐÁNH GIÁ NGAY
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import api from '@/services/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  orderCode: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const rating = ref(5)
const fitFeedback = ref('TRUE_TO_SIZE')
const comment = ref('')
const photoUrls = ref([])
const submitting = ref(false)
const uploading = ref(false)
const fileInputRef = ref(null)

const ratingLabel = computed(() => {
  const map = {
    1: 'Rất không hài lòng',
    2: 'Tạm được',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Cực kỳ hài lòng / Tuyệt vời'
  }
  return map[rating.value] || 'Tuyệt vời'
})

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('Kích thước ảnh tối đa là 10MB!')
    return
  }

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const uploadedUrl = res.data?.data?.fileUrl || res.data?.fileUrl
    if (uploadedUrl) {
      photoUrls.value.push(uploadedUrl)
      ElMessage.success('Đã tải ảnh on-feet thành công!')
    }
  } catch (err) {
    console.warn('Lỗi tải ảnh:', err)
    ElMessage.error('Không thể tải ảnh lên máy chủ, vui lòng thử lại!')
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const submitReview = async () => {
  if (!props.product?.id) {
    ElMessage.warning('Không tìm thấy thông tin sản phẩm!')
    return
  }
  if (!comment.value.trim()) {
    ElMessage.warning('Vui lòng nhập nhận xét của bạn về đôi giày!')
    return
  }

  submitting.value = true
  try {
    const payload = {
      orderCode: props.orderCode,
      customerPhone: props.customerPhone,
      rating: rating.value,
      fitFeedback: fitFeedback.value,
      comment: comment.value.trim(),
      photoUrls: photoUrls.value
    }

    await storeService.submitProductReview(props.product.id, payload)
    ElMessage.success('🎉 Cảm ơn bạn đã gửi đánh giá! Review của bạn đã được xuất bản.')
    visible.value = false
    emit('submitted')
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Không thể gửi đánh giá'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.customer-review-dialog {
  :deep(.el-dialog__body) {
    padding: 16px 20px 20px;
  }
}

.review-modal-body {
  .review-product-header {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 16px;

    .review-prod-img {
      width: 50px;
      height: 50px;
      object-fit: contain;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;

      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .review-prod-info {
      .review-prod-name {
        font-size: 13px;
        font-weight: 800;
        color: #0f172a;
      }
      .review-prod-sub {
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
        margin-top: 2px;
      }
    }
  }

  .form-group {
    margin-bottom: 16px;

    .group-label {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
  }

  .stars-interactive-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .rating-vibe-text {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .fit-radio-group {
    width: 100%;
    display: flex;

    :deep(.el-radio-button) {
      flex: 1;
      .el-radio-button__inner {
        width: 100%;
        font-size: 11px;
        font-weight: 700;
        padding: 8px 6px;
      }
    }
  }

  .photo-upload-row {
    display: flex;
    gap: 10px;
    align-items: center;

    .uploaded-thumb-box {
      position: relative;
      width: 65px;
      height: 65px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .btn-remove-photo {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        background: rgba(0, 0, 0, 0.65);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .upload-trigger-btn {
      width: 65px;
      height: 65px;
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.15s ease;

      &:hover {
        border-color: #000000;
        background: #f1f5f9;
      }

      .cam-icon {
        font-size: 18px;
      }

      .upload-text {
        font-size: 10px;
        font-weight: 700;
        color: #475569;
        margin-top: 2px;
      }

      .upload-loading {
        font-size: 10px;
        color: #0284c7;
        font-weight: 700;
      }
    }
  }

  .photo-hint {
    font-size: 11px;
    color: #64748b;
    margin: 6px 0 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .btn-submit-review {
    background: #000000;
    border-color: #000000;
    font-weight: 800;
    height: 38px;
    padding: 0 20px;

    &:hover {
      background: #10b981;
      border-color: #10b981;
    }
  }
}
</style>
