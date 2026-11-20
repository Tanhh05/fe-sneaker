<template>
  <el-dialog
    v-model="dialogVisible"
    title="IN TEM NHÃN MÃ VẠCH DÁN HỘP GIÀY (SHOE BOX BARCODE)"
    width="780px"
    class="barcode-print-dialog"
    :close-on-click-modal="false"
  >
    <div class="barcode-modal-body">
      <!-- Toolbar: Template & Copies -->
      <div class="print-toolbar no-print">
        <div class="tool-group">
          <span class="tool-label">Khổ tem in:</span>
          <el-radio-group v-model="labelSize" size="small">
            <el-radio-button label="75x50">Tem nhiệt dán hộp (75 x 50 mm)</el-radio-button>
            <el-radio-button label="50x30">Tem nhiệt nhỏ (50 x 30 mm)</el-radio-button>
            <el-radio-button label="A4">Giấy Decal A4 (3 Cột)</el-radio-button>
          </el-radio-group>
        </div>

        <div class="tool-group">
          <span class="tool-label">Số tem mỗi mẫu:</span>
          <el-input-number
            v-model="defaultCopies"
            :min="1"
            :max="100"
            size="small"
            style="width: 110px"
            @change="applyCopiesToAll"
          />
        </div>
      </div>

      <!-- Preview container -->
      <div class="preview-scroll-area">
        <component :is="'style'">
          @media print {
            @page {
              size: {{ labelSize === '50x30' ? '50mm 30mm' : (labelSize === '75x50' ? '75mm 50mm' : 'A4 portrait') }};
              margin: {{ labelSize === 'A4' ? '8mm' : '0' }};
            }
          }
        </component>

        <div class="preview-notice no-print">
          <span>💡 Xem trước bản in: Mã vạch chuẩn Code128, máy quét cầm tay hoặc camera có thể đọc tức thì trong 1 giây.</span>
        </div>

        <!-- PRINTABLE LABELS CONTAINER -->
        <div id="printable-labels-container" class="printable-labels-container" :class="`layout-${labelSize}`">
          <template v-for="(item, idx) in expandedItems" :key="`${item.sku}-${idx}-${labelSize}`">
            <div class="shoe-box-label" :class="`size-${labelSize}`">
              <!-- Label Header -->
              <div class="lbl-header">
                <span class="lbl-brand">{{ item.brandName || 'SNEAKERHUB' }}</span>
                <span class="lbl-kicker">AUTHENTIC ARCHIVE</span>
              </div>

              <!-- Product Name -->
              <div class="lbl-product-name" :title="item.productName">
                {{ item.productName }}
              </div>

              <!-- Specs: Size, Color, Price -->
              <div class="lbl-specs">
                <div class="spec-col">
                  <span class="spec-k">SIZE EU:</span>
                  <strong class="spec-v size-highlight">{{ item.sizeValue }}</strong>
                </div>
                <div class="spec-col">
                  <span class="spec-k">MÀU:</span>
                  <strong class="spec-v">{{ item.colorName }}</strong>
                </div>
                <div class="spec-col price-col">
                  <span class="spec-k">GIÁ NIÊM YẾT:</span>
                  <strong class="spec-v price-highlight">{{ formatCurrency(item.salePrice) }}</strong>
                </div>
              </div>

              <!-- Barcode SVG Rendered by JsBarcode -->
              <div class="lbl-barcode-wrapper">
                <svg :ref="(el) => renderBarcode(el, item.sku)" :data-sku="item.sku" class="barcode-svg"></svg>
              </div>

              <!-- Label Footer -->
              <div class="lbl-footer">
                <span>SKU: {{ item.sku }}</span>
                <span>ORIGINAL BOX &amp; ACCESSORIES</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer no-print">
        <div class="footer-count">
          Tổng số tem sẽ in: <strong>{{ expandedItems.length }} tem</strong>
        </div>
        <div>
          <el-button @click="dialogVisible = false">Đóng</el-button>
          <el-button type="primary" :icon="Printer" @click="handlePrint">
            IN TEM NGAY (Ctrl + P)
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Printer } from '@element-plus/icons-vue'
import JsBarcode from 'jsbarcode'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const labelSize = ref('75x50')
const defaultCopies = ref(1)
const itemCopies = ref({})

// Initialize copies
watch(
  () => props.items,
  (newItems) => {
    const map = {}
    newItems.forEach((it) => {
      map[it.sku] = it.printQuantity || defaultCopies.value || 1
    })
    itemCopies.value = map
    nextTick(() => {
      renderAllBarcodes()
    })
  },
  { immediate: true }
)

const applyCopiesToAll = (val) => {
  const map = {}
  props.items.forEach((it) => {
    map[it.sku] = val
  })
  itemCopies.value = map
  nextTick(() => {
    renderAllBarcodes()
  })
}

// Expand items based on copies
const expandedItems = computed(() => {
  const result = []
  props.items.forEach((it) => {
    const qty = itemCopies.value[it.sku] || defaultCopies.value || 1
    for (let i = 0; i < qty; i++) {
      result.push({ ...it })
    }
  })
  return result
})

watch(
  [dialogVisible, labelSize, expandedItems],
  () => {
    if (dialogVisible.value) {
      nextTick(() => {
        setTimeout(() => {
          renderAllBarcodes()
        }, 40)
      })
    }
  },
  { deep: true }
)

const barcodeRefs = ref([])

function renderBarcode(el, sku) {
  if (!el || !sku) return
  try {
    const isSmall = labelSize.value === '50x30'
    JsBarcode(el, String(sku).trim().toUpperCase(), {
      format: 'CODE128',
      lineColor: '#000000',
      width: isSmall ? 1.15 : 1.8,
      height: isSmall ? 20 : 38,
      displayValue: true,
      fontSize: isSmall ? 9 : 12,
      font: 'monospace',
      fontOptions: 'bold',
      margin: isSmall ? 1 : 2,
      textMargin: 1
    })
  } catch (e) {
    console.warn('JsBarcode render error:', e)
  }
}

function renderAllBarcodes() {
  const svgs = document.querySelectorAll('#printable-labels-container .barcode-svg')
  svgs.forEach((svg) => {
    const sku = svg.getAttribute('data-sku')
    if (sku) {
      renderBarcode(svg, sku)
    }
  })
}

const handlePrint = () => {
  window.print()
}
</script>

<style lang="scss">
.barcode-print-dialog {
  .el-dialog__body {
    padding: 14px 20px 20px;
  }
}

.barcode-modal-body {
  .print-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;

    .tool-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .tool-label {
        font-size: 12px;
        font-weight: 700;
        color: #475569;
      }
    }
  }

  .preview-scroll-area {
    max-height: 480px;
    overflow-y: auto;
    background: #f1f5f9;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;

    .preview-notice {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      margin-bottom: 14px;
    }
  }
}

/* LABELS CONTAINER */
.printable-labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;

  &.layout-A4 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  /* INDIVIDUAL LABEL (SHOE BOX STICKER) */
  .shoe-box-label {
    background: #ffffff;
    border: 2px solid #000000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 10px;
    page-break-inside: avoid;
    break-inside: avoid;

    &.size-75x50 {
      width: 290px;
      height: 195px;
    }

    &.size-50x30 {
      width: 225px;
      height: 145px;
      padding: 5px 8px;

      .lbl-header {
        border-bottom-width: 1px;
        padding-bottom: 2px;
        margin-bottom: 3px;

        .lbl-brand {
          font-size: 11px;
        }
        .lbl-kicker {
          font-size: 8px;
        }
      }

      .lbl-product-name {
        font-size: 10.5px !important;
        line-height: 1.25 !important;
        height: auto !important;
        max-height: 15px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        -webkit-line-clamp: unset !important;
        margin-bottom: 3px !important;
      }

      .lbl-specs {
        padding: 2px 5px !important;
        margin-bottom: 2px !important;

        .spec-col {
          .spec-k {
            font-size: 7px !important;
            line-height: 1 !important;
          }
          .spec-v {
            font-size: 10.5px !important;
            line-height: 1.1 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;

            &.size-highlight {
              font-size: 12.5px !important;
            }
            &.price-highlight {
              font-size: 10.5px !important;
            }
          }

          &:nth-child(2) {
            max-width: 78px;
          }
        }
      }

      .lbl-barcode-wrapper {
        margin: 1px 0 !important;

        .barcode-svg {
          max-height: 36px;
        }
      }

      .lbl-footer {
        padding-top: 2px !important;
        font-size: 7px !important;
      }
    }

    &.size-A4 {
      width: 100%;
      height: 180px;
    }

    .lbl-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;

      .lbl-brand {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #000000;
      }

      .lbl-kicker {
        font-size: 9px;
        font-weight: 700;
        color: #4b5563;
        letter-spacing: 0.02em;
      }
    }

    .lbl-product-name {
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 800;
      color: #000000;
      line-height: 1.25;
      max-height: 32px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 4px;
    }

    .lbl-specs {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 4px 6px;
      margin-bottom: 4px;

      .spec-col {
        display: flex;
        flex-direction: column;
        line-height: 1.15;

        .spec-k {
          font-size: 8px;
          font-weight: 700;
          color: #6b7280;
        }

        .spec-v {
          font-size: 13px;
          font-weight: 800;
          color: #111827;

          &.size-highlight {
            font-size: 15px;
            font-weight: 900;
            color: #000000;
          }

          &.price-highlight {
            font-size: 12px;
            font-weight: 900;
            color: #dc2626;
          }
        }

        &.price-col {
          text-align: right;
        }
      }
    }

    .lbl-barcode-wrapper {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      margin: 2px 0;

      .barcode-svg {
        max-width: 100%;
        height: auto;
      }
    }

    .lbl-footer {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #9ca3af;
      padding-top: 2px;
      font-size: 8px;
      font-weight: 700;
      color: #4b5563;
      letter-spacing: 0.02em;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .footer-count {
    font-size: 13px;
    color: #475569;
    strong {
      color: #0f172a;
      font-size: 14px;
    }
  }
}

/* PRINT MEDIA STYLES */
@media print {
  /* Hide all app chrome */
  body * {
    visibility: hidden;
  }

  .no-print {
    display: none !important;
  }

  /* Only show printable container */
  #printable-labels-container,
  #printable-labels-container * {
    visibility: visible;
  }

  #printable-labels-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    gap: 0;
    background: transparent;

    .shoe-box-label {
      border: 1.5px solid #000000 !important;
      page-break-after: always;
      break-after: page;
      margin: 0 auto;

      &.size-50x30 {
        width: 50mm !important;
        height: 30mm !important;
        max-width: 50mm !important;
        max-height: 30mm !important;
        padding: 1.5mm 2.5mm !important;
        box-sizing: border-box !important;
        border: 1px solid #000000 !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      &.size-75x50 {
        width: 75mm !important;
        height: 50mm !important;
        max-width: 75mm !important;
        max-height: 50mm !important;
        padding: 2.5mm 3.5mm !important;
        box-sizing: border-box !important;
        border: 1.5px solid #000000 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
    }
  }
}
</style>
