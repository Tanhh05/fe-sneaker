<template>
  <el-dialog
    v-model="visible"
    title="GỢI Ý SIZE GIÀY PHÙ HỢP"
    width="560px"
    class="smart-size-dialog"
    :close-on-click-modal="true"
  >
    <div class="size-finder-body">
      <!-- Subtitle description -->
      <p class="finder-subtitle">
        Hệ thống tự động phân tích độ chênh form của <strong>{{ productName || 'đôi sneaker này' }}</strong> so với đôi bạn đang đi để gợi ý size vừa vặn nhất.
      </p>

      <!-- Minimalist Segmented Tabs -->
      <div class="finder-tabs">
        <button
          type="button"
          class="finder-tab-btn"
          :class="{ active: activeMode === 'compare' }"
          @click="activeMode = 'compare'"
        >
          Theo đôi giày đang đi
        </button>
        <button
          type="button"
          class="finder-tab-btn"
          :class="{ active: activeMode === 'cm' }"
          @click="activeMode = 'cm'"
        >
          Đo theo chiều dài chân (cm)
        </button>
      </div>

      <!-- MODE 1: COMPARE -->
      <div v-if="activeMode === 'compare'" class="mode-content">
        <div class="form-grid">
          <div class="form-col">
            <label class="form-label">Thương hiệu đang đi:</label>
            <el-select v-model="compareBrand" style="width: 100%">
              <el-option
                v-for="b in brandOptions"
                :key="b.value"
                :label="b.label"
                :value="b.value"
              />
            </el-select>
          </div>

          <div class="form-col">
            <label class="form-label">Dòng giày đang đi:</label>
            <el-select v-model="compareModel" style="width: 100%">
              <el-option
                v-for="m in currentModelOptions"
                :key="m.value"
                :label="m.label"
                :value="m.value"
              />
            </el-select>
          </div>

          <div class="form-col">
            <label class="form-label">Size EU bạn đang đi:</label>
            <el-select v-model="compareSize" style="width: 100%">
              <el-option
                v-for="sz in sizeOptions"
                :key="sz"
                :label="`EU ${sz}`"
                :value="sz"
              />
            </el-select>
          </div>
        </div>

        <!-- Result Box -->
        <div class="result-card">
          <div class="result-top">
            <span class="result-kicker">GỢI Ý CHO MẪU GIÀY NÀY</span>
            <div class="result-size-badge">
              SIZE EU <strong>{{ recommendedSizeCompare }}</strong>
            </div>
          </div>
          <p class="result-reason">{{ compareReason }}</p>
        </div>
      </div>

      <!-- MODE 2: CM -->
      <div v-else class="mode-content">
        <div class="cm-input-block">
          <div class="cm-header">
            <label class="form-label">Chiều dài bàn chân:</label>
            <span class="cm-badge">{{ footLengthCm.toFixed(1) }} cm</span>
          </div>
          <el-slider
            v-model="footLengthCm"
            :min="22.0"
            :max="29.5"
            :step="0.5"
            show-stops
            class="cm-slider"
          />
          <div class="cm-hint">
            * Mẹo: Đặt gót chân chạm tường, đo khoảng cách từ gót đến ngón chân dài nhất.
          </div>
        </div>

        <!-- Result Box for CM -->
        <div class="result-card">
          <div class="result-top">
            <span class="result-kicker">GỢI Ý CHO MẪU GIÀY NÀY</span>
            <div class="result-size-badge">
              SIZE EU <strong>{{ recommendedSizeCm }}</strong>
            </div>
          </div>
          <div class="result-sub-info">
            <span>Chiều dài lót: ~{{ (footLengthCm + 0.5).toFixed(1) }} cm</span>
            <span>•</span>
            <span>US Men: {{ getUsSize(recommendedSizeCm) }}</span>
            <span>•</span>
            <span>UK: {{ getUkSize(recommendedSizeCm) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="btn-dialog-cancel" @click="visible = false">
          Đóng
        </button>
        <button type="button" class="btn-dialog-apply" @click="applyRecommendedSize">
          ÁP DỤNG SIZE {{ currentRecSize }} &rarr;
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  productName: {
    type: String,
    default: ''
  },
  brandName: {
    type: String,
    default: ''
  },
  availableSizes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select-size'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeMode = ref('compare')

// Compare Mode State
const compareBrand = ref('Nike')
const compareModel = ref('af1')
const compareSize = ref(40)

const brandOptions = [
  { label: 'Nike', value: 'Nike' },
  { label: 'Adidas', value: 'Adidas' },
  { label: 'Jordan', value: 'Jordan' },
  { label: 'Converse', value: 'Converse' },
  { label: 'Vans', value: 'Vans' },
  { label: 'Puma', value: 'Puma' }
]

const modelsByBrand = {
  Nike: [
    { label: 'Air Force 1 (Form chuẩn rộng)', value: 'af1', delta: 0 },
    { label: 'Air Jordan 1 (Chuẩn size)', value: 'aj1', delta: 0 },
    { label: 'Air Max 90 / 97 (Hơi ôm ngang)', value: 'airmax', delta: +0.5 },
    { label: 'Nike Dunk Low (Chuẩn size)', value: 'dunk', delta: 0 }
  ],
  Adidas: [
    { label: 'Ultraboost (Ôm chân +0.5)', value: 'ultraboost', delta: +0.5 },
    { label: 'Yeezy Boost 350 V2 (Rất ôm mũi +1.0)', value: 'yeezy350', delta: +1.0 },
    { label: 'Stan Smith / Superstar (Chuẩn size)', value: 'stansmith', delta: 0 },
    { label: 'Samba / Gazelle (Form thon mũi)', value: 'samba', delta: +0.5 }
  ],
  Jordan: [
    { label: 'Air Jordan 1 High / Low (Chuẩn size)', value: 'aj1', delta: 0 },
    { label: 'Air Jordan 4 (Hơi bó ngón út)', value: 'aj4', delta: +0.5 }
  ],
  Converse: [
    { label: 'Chuck Taylor All Star (Form dài -0.5)', value: 'chuck', delta: -0.5 },
    { label: 'Chuck 70s (Form dài -0.5 đến -1.0)', value: 'chuck70', delta: -0.5 }
  ],
  Vans: [
    { label: 'Old Skool / Era (Chuẩn size)', value: 'oldskool', delta: 0 },
    { label: 'Slip-on (Chuẩn size)', value: 'slipon', delta: 0 }
  ],
  Puma: [
    { label: 'Puma Suede (Chuẩn size)', value: 'suede', delta: 0 },
    { label: 'Puma Palermo (Chuẩn size)', value: 'palermo', delta: 0 }
  ]
}

const currentModelOptions = computed(() => {
  return modelsByBrand[compareBrand.value] || modelsByBrand.Nike
})

watch(compareBrand, (newBrand) => {
  const models = modelsByBrand[newBrand] || []
  if (models.length > 0) {
    compareModel.value = models[0].value
  }
})

const sizeOptions = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

// Target Sneaker Form Analysis
const targetDelta = computed(() => {
  const name = (props.productName || '').toLowerCase()
  if (name.includes('yeezy') || name.includes('350')) return +0.5
  if (name.includes('chuck') || name.includes('converse')) return -0.5
  if (name.includes('ultraboost')) return +0.5
  if (name.includes('air max')) return +0.5
  return 0
})

const currentModelDelta = computed(() => {
  const list = currentModelOptions.value
  const found = list.find((m) => m.value === compareModel.value)
  return found ? found.delta : 0
})

const recommendedSizeCompare = computed(() => {
  const baseSize = Number(compareSize.value) || 40
  const diff = targetDelta.value - currentModelDelta.value

  let target = baseSize
  if (diff >= 0.5) target += 1
  else if (diff <= -0.5) target -= 1

  return Math.max(36, Math.min(45, Math.round(target)))
})

const compareReason = computed(() => {
  const diff = targetDelta.value - currentModelDelta.value
  if (diff > 0) {
    return `Mẫu giày này form ôm hơn đôi bạn đang đi. Khuyên bạn nên tăng 0.5 - 1 size (chọn Size ${recommendedSizeCompare.value}) để ngón chân thoải mái nhất.`
  } else if (diff < 0) {
    return `Mẫu giày này có form thuôn dài. Khuyên bạn nên lùi 0.5 size (chọn Size ${recommendedSizeCompare.value}) để ôm gót vừa vặn.`
  } else {
    return `Mẫu giày này có form chuẩn (True to size). Khuyên bạn giữ nguyên Size ${recommendedSizeCompare.value}.`
  }
})

// CM Mode State
const footLengthCm = ref(25.5)

const cmToEuMap = [
  { cm: 22.0, eu: 36 },
  { cm: 22.5, eu: 36 },
  { cm: 23.0, eu: 37 },
  { cm: 23.5, eu: 37 },
  { cm: 24.0, eu: 38 },
  { cm: 24.5, eu: 39 },
  { cm: 25.0, eu: 40 },
  { cm: 25.5, eu: 40 },
  { cm: 26.0, eu: 41 },
  { cm: 26.5, eu: 42 },
  { cm: 27.0, eu: 42 },
  { cm: 27.5, eu: 43 },
  { cm: 28.0, eu: 44 },
  { cm: 28.5, eu: 44 },
  { cm: 29.0, eu: 45 }
]

const recommendedSizeCm = computed(() => {
  const val = footLengthCm.value
  let bestEu = 40
  for (const item of cmToEuMap) {
    if (val >= item.cm) {
      bestEu = item.eu
    }
  }
  if (targetDelta.value > 0) {
    bestEu = Math.min(45, bestEu + 1)
  } else if (targetDelta.value < 0) {
    bestEu = Math.max(36, bestEu - 1)
  }
  return bestEu
})

const currentRecSize = computed(() => {
  return activeMode.value === 'compare' ? recommendedSizeCompare.value : recommendedSizeCm.value
})

const getUsSize = (eu) => {
  const map = { 36: '4', 37: '5', 38: '5.5', 39: '6.5', 40: '7', 41: '8', 42: '8.5', 43: '9.5', 44: '10', 45: '11' }
  return map[eu] || '7.5'
}

const getUkSize = (eu) => {
  const map = { 36: '3.5', 37: '4.5', 38: '5', 39: '6', 40: '6.5', 41: '7.5', 42: '8', 43: '9', 44: '9.5', 45: '10.5' }
  return map[eu] || '7'
}

const applyRecommendedSize = () => {
  const rec = String(currentRecSize.value)
  emit('select-size', rec)
  ElMessage.success(`Đã tự động chọn Size ${rec} cho bạn!`)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.smart-size-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px 24px 14px;
    border-bottom: 1px solid #f1f5f9;
    .el-dialog__title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 24px 20px;
    border-top: 1px solid #f1f5f9;
  }
}

.size-finder-body {
  .finder-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 16px;
    line-height: 1.5;

    strong {
      color: #0f172a;
    }
  }

  .finder-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 6px;
    gap: 4px;
    margin-bottom: 20px;

    .finder-tab-btn {
      flex: 1;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.15s ease;

      &:hover {
        color: #0f172a;
      }

      &.active {
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 18px;

    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }

    .form-col {
      .form-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
    }
  }

  .cm-input-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 18px;

    .cm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .form-label {
        font-size: 12px;
        font-weight: 700;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .cm-badge {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 3px 10px;
        border-radius: 4px;
      }
    }

    .cm-slider {
      margin-bottom: 8px;
    }

    .cm-hint {
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
    }
  }

  .result-card {
    background: #f8fafc;
    border: 1px solid #0f172a;
    border-radius: 6px;
    padding: 16px 20px;

    .result-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .result-kicker {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
      }

      .result-size-badge {
        background: #0f172a;
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        padding: 5px 14px;
        border-radius: 4px;

        strong {
          font-size: 16px;
          margin-left: 2px;
        }
      }
    }

    .result-reason {
      font-size: 13px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }

    .result-sub-info {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
      font-weight: 600;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .btn-dialog-cancel {
    height: 38px;
    padding: 0 16px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  }

  .btn-dialog-apply {
    height: 38px;
    padding: 0 20px;
    background: #0f172a;
    border: 1px solid #0f172a;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #000000;
      transform: translateY(-1px);
    }
  }
}
</style>
