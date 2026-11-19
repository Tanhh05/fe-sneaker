<template>
  <div class="page-container pos-page">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Bán Hàng Tại Quầy (POS Counter)</h2>
        <p class="page-subtitle">Tìm giày theo tên hoặc mã SKU, chọn Size &amp; Màu sắc, kiểm tra số lượng sẵn có và xuất hóa đơn</p>
      </div>
      <div>
        <el-button @click="loadCatalog">Làm mới danh mục SKU</el-button>
        <el-button type="primary" plain @click="$router.push('/orders')">
          Danh sách đơn hàng &rarr;
        </el-button>
      </div>
    </div>

    <el-row :gutter="18">
      <!-- LEFT COLUMN: Product & Variant Picker -->
      <el-col :xs="24" :lg="14">
        <div class="table-card pos-catalog-card" v-loading="loading">
          <!-- HIGH-SPEED BARCODE SCANNER BOX -->
          <div class="pos-barcode-scanner-bar">
            <div class="scanner-hero">
              <div class="scanner-badge-laser">
                <span class="laser-dot"></span>
                <span class="scanner-label">MÁY QUÉT MÃ VẠCH (BARCODE SCANNER)</span>
                <span class="scanner-tip">⚡ Hỗ trợ máy quét cầm tay USB / Bluetooth &amp; Camera</span>
              </div>
              <div class="scanner-row">
                <el-input
                  ref="barcodeInputRef"
                  v-model="barcodeScanInput"
                  placeholder="⚡ BẮN MÃ VẠCH TRÊN HỘP GIÀY (SKU) — Tự động thêm vào đơn trong 1 giây..."
                  size="large"
                  clearable
                  class="barcode-quick-input"
                  @keyup.enter="handleBarcodeScanned"
                >
                  <template #prefix>
                    <el-icon class="input-scan-icon"><Tickets /></el-icon>
                  </template>
                  <template #append>
                    <el-button type="primary" class="btn-scan-action" @click="handleBarcodeScanned">
                      THÊM NGAY (ENTER)
                    </el-button>
                  </template>
                </el-input>
                <el-button
                  type="success"
                  plain
                  size="large"
                  class="btn-camera-scan"
                  @click="openCameraScanner"
                >
                  📸 Camera Quét
                </el-button>
              </div>
            </div>
          </div>

          <!-- Search & Filter Bar -->
          <el-row :gutter="10" style="margin-bottom: 14px">
            <el-col :xs="24" :sm="10">
              <el-input
                v-model="searchQuery"
                placeholder="Tìm nhanh theo tên giày hoặc mã SKU (VD: AF1-40-W)..."
                clearable
                :prefix-icon="Search"
              />
            </el-col>
            <el-col :xs="12" :sm="7">
              <el-select v-model="selectedSizeFilter" placeholder="Lọc Size EU" clearable style="width: 100%">
                <el-option v-for="s in sizes" :key="s.id" :label="`Size ${s.sizeValue}`" :value="s.id" />
              </el-select>
            </el-col>
            <el-col :xs="12" :sm="7">
              <el-select v-model="selectedColorFilter" placeholder="Lọc Màu sắc" clearable style="width: 100%">
                <el-option v-for="c in colors" :key="c.id" :label="c.colorName" :value="c.id" />
              </el-select>
            </el-col>
          </el-row>

          <!-- Interactive Product -> Size -> Color Selector Box -->
          <div class="selector-panel">
            <div class="selector-title">Chọn theo từng bước (Sản phẩm &rarr; Size &rarr; Màu sắc):</div>
            <el-row :gutter="10" align="middle">
              <el-col :xs="24" :sm="9">
                <el-select
                  v-model="stepProductId"
                  placeholder="1. Chọn mẫu giày Sneaker"
                  filterable
                  clearable
                  style="width: 100%"
                  @change="onStepProductChange"
                >
                  <el-option
                    v-for="p in activeProducts"
                    :key="p.id"
                    :label="`${p.productCode} - ${p.productName}`"
                    :value="p.id"
                  />
                </el-select>
              </el-col>
              <el-col :xs="12" :sm="5">
                <el-select
                  v-model="stepSizeId"
                  placeholder="2. Chọn Size"
                  :disabled="!stepProductId"
                  clearable
                  style="width: 100%"
                  @change="onStepSizeChange"
                >
                  <el-option
                    v-for="s in availableSizesForStepProduct"
                    :key="s.sizeId"
                    :label="`Size ${s.sizeValue}`"
                    :value="s.sizeId"
                  />
                </el-select>
              </el-col>
              <el-col :xs="12" :sm="5">
                <el-select
                  v-model="stepColorId"
                  placeholder="3. Chọn Màu"
                  :disabled="!stepSizeId"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="c in availableColorsForStep"
                    :key="c.colorId"
                    :label="c.colorName"
                    :value="c.colorId"
                  />
                </el-select>
              </el-col>
              <el-col :xs="24" :sm="5">
                <el-button
                  type="primary"
                  style="width: 100%"
                  :disabled="!matchedStepVariant || matchedStepVariant.availableQuantity <= 0"
                  @click="addVariantToCart(matchedStepVariant)"
                >
                  + Thêm vào đơn
                </el-button>
              </el-col>
            </el-row>
            <div v-if="matchedStepVariant" class="step-match-info">
              SKU: <span class="code-badge">{{ matchedStepVariant.sku }}</span> |
              Giá bán: <strong class="price-text">{{ formatCurrency(matchedStepVariant.salePrice) }}</strong> |
              Số lượng sẵn có: <strong>{{ matchedStepVariant.availableQuantity }} đôi</strong>
            </div>
          </div>

          <!-- Variant SKU Grid / Table -->
          <el-table :data="paginatedVariants" stripe border style="width: 100%">
            <template #empty>
              <el-empty description="Không tìm thấy biến thể SKU phù hợp" :image-size="72" />
            </template>
            <el-table-column label="Mã SKU" width="115">
              <template #default="{ row }">
                <span class="code-badge">{{ row.sku }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Sản phẩm Sneaker" min-width="160">
              <template #default="{ row }">
                <div class="pos-prod-cell">
                  <img
                    v-if="row.thumbnailUrl"
                    :src="row.thumbnailUrl"
                    alt="sneaker"
                    class="pos-prod-thumb"
                  />
                  <div v-else class="pos-prod-thumb placeholder">SNK</div>
                  <div class="pos-prod-meta">
                    <span class="pos-prod-title">{{ row.productName }}</span>
                    <span class="pos-prod-sub">{{ row.productCode }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Size / Màu" width="125">
              <template #default="{ row }">
                <div class="pos-attr-cell">
                  <span class="code-badge" style="font-size: 10.5px; padding: 1px 5px">
                    {{ row.sizeValue }}
                  </span>
                  <span class="color-dot" :style="{ backgroundColor: row.hexCode }"></span>
                  <span class="color-text">{{ row.colorName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Đơn giá" width="110" align="right">
              <template #default="{ row }">
                <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Sẵn có" width="75" align="center">
              <template #default="{ row }">
                <el-tag :type="row.availableQuantity > 0 ? 'success' : 'danger'" size="small">
                  {{ row.availableQuantity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Chọn" width="100" align="center">
              <template #default="{ row }">
                <div class="row-actions">
                  <button
                    class="action-btn"
                    title="In tem mã vạch dán hộp giày"
                    @click="printSingleVariant(row)"
                  >
                    <el-icon><Printer /></el-icon>
                  </button>
                  <button
                    class="action-btn primary"
                    :disabled="row.availableQuantity <= 0"
                    title="Thêm vào đơn hàng"
                    @click="addVariantToCart(row)"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination Bar -->
          <div class="pos-pagination-bar">
            <span class="pos-pagination-info">
              Hiển thị <strong>{{ paginatedVariants.length }}</strong> / <strong>{{ filteredVariants.length }}</strong> biến thể
            </span>
            <el-pagination
              v-model:current-page="posPagination.page"
              :page-size="posPagination.size"
              :total="filteredVariants.length"
              layout="prev, pager, next"
              small
            />
          </div>
        </div>
      </el-col>

      <!-- RIGHT COLUMN: Current Order Cart & Checkout -->
      <el-col :xs="24" :lg="10">
        <div class="table-card pos-cart-card">
          <div class="cart-header">
            <h3>Đơn hàng hiện tại ({{ totalCartQty }} đôi)</h3>
            <el-button
              v-if="cart.length > 0"
              size="small"
              type="danger"
              text
              @click="cart = []"
            >
              Xóa toàn bộ giỏ
            </el-button>
          </div>

          <!-- Customer Selection + Quick Add Customer -->
          <div class="customer-box">
            <div class="box-label">Khách hàng mua tại quầy:</div>
            <div class="cust-row">
              <el-select
                v-model="checkoutForm.customerId"
                filterable
                clearable
                placeholder="Khách lẻ tại quầy (Hoặc tìm theo tên/SĐT)"
                style="flex: 1"
              >
                <el-option
                  v-for="c in customers"
                  :key="c.id"
                  :label="`${c.fullName} - ${c.phone} (${c.customerCode})`"
                  :value="c.id"
                />
              </el-select>
              <button class="pos-cust-btn" @click="quickCustVisible = true">
                + Khách mới
              </button>
            </div>
          </div>

          <!-- Cart Items -->
          <div v-if="cart.length === 0" class="empty-cart">
            <el-empty description="Chưa có sản phẩm nào trong đơn hàng" :image-size="85" />
          </div>
          <div v-else class="cart-list">
            <div v-for="(item, index) in cart" :key="item.variant.id" class="cart-item">
              <div class="item-info">
                <div class="item-title">{{ item.variant.productName }}</div>
                <div class="item-meta">
                  <span class="code-badge">{{ item.variant.sku }}</span>
                  <span>Size {{ item.variant.sizeValue }} · {{ item.variant.colorName }}</span>
                  <span class="avail">(Sẵn có: {{ item.variant.availableQuantity }})</span>
                </div>
                <div class="item-price">
                  {{ formatCurrency(item.variant.salePrice) }} x {{ item.quantity }} =
                  <strong class="price-text">{{ formatCurrency(item.variant.salePrice * item.quantity) }}</strong>
                </div>
              </div>
              <div class="item-actions">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.variant.availableQuantity"
                  size="small"
                  style="width: 100px"
                />
                <button
                  class="cart-delete-btn"
                  title="Xóa khỏi đơn"
                  @click="cart.splice(index, 1)"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Payment & Summary -->
          <div class="checkout-section">
            <el-form label-position="top" size="small">
              <el-row :gutter="12">
                <el-col :span="12">
                  <el-form-item label="Phương thức thanh toán">
                    <el-radio-group v-model="checkoutForm.paymentMethod">
                      <el-radio-button label="CASH">Tiền mặt</el-radio-button>
                      <el-radio-button label="BANK_TRANSFER">Chuyển khoản</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Trạng thái xác nhận đơn">
                    <el-select v-model="checkoutForm.status" style="width: 100%">
                      <el-option label="Hoàn thành ngay (COMPLETED)" value="COMPLETED" />
                      <el-option label="Xác nhận giữ đơn (CONFIRMED)" value="CONFIRMED" />
                      <el-option label="Lưu đơn nháp (DRAFT)" value="DRAFT" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item
                v-if="checkoutForm.paymentMethod === 'BANK_TRANSFER'"
                label="Mã giao dịch chuyển khoản / Ngân hàng"
              >
                <el-input v-model="checkoutForm.paymentReference" placeholder="VD: Vietcombank FT26313..." />
              </el-form-item>

              <el-form-item label="Ghi chú đơn hàng">
                <el-input v-model="checkoutForm.note" placeholder="Ghi chú thêm nếu có..." />
              </el-form-item>
            </el-form>

            <div class="summary-totals">
              <div class="row">
                <span>Tổng số lượng:</span>
                <strong>{{ totalCartQty }} đôi</strong>
              </div>
              <div class="row">
                <span>Tổng tiền hàng:</span>
                <strong>{{ formatCurrency(totalCartAmount) }}</strong>
              </div>
              <div class="row final">
                <span>THÀNH TIỀN THANH TOÁN:</span>
                <span>{{ formatCurrency(totalCartAmount) }}</span>
              </div>
            </div>

            <button
              class="pos-checkout-btn"
              :disabled="cart.length === 0 || submitting"
              @click="submitSaleOrder"
            >
              <span v-if="submitting">Đang tạo đơn hàng...</span>
              <span v-else>XÁC NHẬN ĐƠN HÀNG &amp; XUẤT HÓA ĐƠN</span>
            </button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Quick Add Customer Modal -->
    <PosQuickCustomerDialog v-model="quickCustVisible" @created="onQuickCustomerCreated" />

    <!-- Printable Invoice Modal -->
    <InvoicePrintModal v-model="invoiceVisible" :order="createdOrder" />

    <!-- CAMERA BARCODE SCANNER MODAL -->
    <el-dialog
      v-model="cameraScannerVisible"
      title="CAMERA QUÉT MÃ VẠCH HỘP GIÀY"
      width="460px"
      :before-close="closeCameraScanner"
      class="camera-scanner-dialog"
    >
      <div class="camera-scanner-body">
        <div class="camera-viewport-wrap">
          <video ref="cameraVideoRef" autoplay playsinline muted class="camera-feed"></video>
          <div class="camera-overlay">
            <div class="scanner-aim-frame">
              <div class="laser-line"></div>
            </div>
            <p class="camera-hint">Căn chỉnh mã vạch Code128 hoặc QR trên hộp giày vào giữa khung quét</p>
          </div>
        </div>
        <div v-if="cameraError" class="camera-err-msg">
          {{ cameraError }}
        </div>
        <div class="camera-manual-input">
          <el-input
            v-model="cameraFallbackInput"
            placeholder="Hoặc gõ / paste mã SKU..."
            size="small"
            @keyup.enter="handleCameraFallbackSubmit"
          >
            <template #append>
              <el-button @click="handleCameraFallbackSubmit">Nhập</el-button>
            </template>
          </el-input>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeCameraScanner">Đóng Camera</el-button>
      </template>
    </el-dialog>

    <!-- BARCODE PRINT MODAL -->
    <BarcodeLabelPrintModal
      v-model="printBarcodeVisible"
      :items="printBarcodeItems"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Delete, Plus, Printer, Tickets } from '@element-plus/icons-vue'
import { variantService } from '@/services/variantService'
import { productService } from '@/services/productService'
import { customerService } from '@/services/customerService'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/formatters'
import { useDebouncedWatch } from '@/composables/useDebounce'
import InvoicePrintModal from '@/components/InvoicePrintModal.vue'
import PosQuickCustomerDialog from './components/PosQuickCustomerDialog.vue'
import BarcodeLabelPrintModal from '@/components/common/BarcodeLabelPrintModal.vue'

const loading = ref(false)
const submitting = ref(false)

// High-speed Barcode Scanner State
const barcodeScanInput = ref('')
const barcodeInputRef = ref(null)
const cameraScannerVisible = ref(false)
const cameraVideoRef = ref(null)
const cameraStream = ref(null)
const cameraError = ref('')
const cameraFallbackInput = ref('')

// Barcode Print Label State
const printBarcodeVisible = ref(false)
const printBarcodeItems = ref([])

const variants = ref([])
const products = ref([])
const sizes = ref([])
const colors = ref([])
const customers = ref([])

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedSizeFilter = ref(null)
const selectedColorFilter = ref(null)

useDebouncedWatch(
  searchQuery,
  () => {
    debouncedSearchQuery.value = searchQuery.value
  },
  300
)

// Step-by-step picker state
const stepProductId = ref(null)
const stepSizeId = ref(null)
const stepColorId = ref(null)

const cart = ref([])
const checkoutForm = reactive({
  customerId: null,
  paymentMethod: 'CASH',
  status: 'COMPLETED',
  paymentReference: '',
  note: ''
})

// Quick customer modal
const quickCustVisible = ref(false)

// Invoice print modal
const invoiceVisible = ref(false)
const createdOrder = ref(null)

const activeProducts = computed(() => products.value.filter((p) => p.status === 'ACTIVE'))

const availableSizesForStepProduct = computed(() => {
  if (!stepProductId.value) return []
  const map = new Map()
  variants.value
    .filter((v) => v.productId === stepProductId.value && v.status === 'ACTIVE')
    .forEach((v) => {
      if (!map.has(v.sizeId)) {
        map.set(v.sizeId, { sizeId: v.sizeId, sizeValue: v.sizeValue })
      }
    })
  return Array.from(map.values())
})

const availableColorsForStep = computed(() => {
  if (!stepProductId.value || !stepSizeId.value) return []
  return variants.value
    .filter((v) => v.productId === stepProductId.value && v.sizeId === stepSizeId.value && v.status === 'ACTIVE')
    .map((v) => ({ colorId: v.colorId, colorName: v.colorName }))
})

const matchedStepVariant = computed(() => {
  if (!stepProductId.value || !stepSizeId.value || !stepColorId.value) return null
  return variants.value.find(
    (v) =>
      v.productId === stepProductId.value &&
      v.sizeId === stepSizeId.value &&
      v.colorId === stepColorId.value
  )
})

const filteredVariants = computed(() => {
  const q = debouncedSearchQuery.value.trim().toLowerCase()
  return variants.value.filter((v) => {
    if (v.status !== 'ACTIVE') return false
    if (selectedSizeFilter.value && v.sizeId !== selectedSizeFilter.value) return false
    if (selectedColorFilter.value && v.colorId !== selectedColorFilter.value) return false
    if (!q) return true
    return (
      v.sku.toLowerCase().includes(q) ||
      v.productName.toLowerCase().includes(q) ||
      (v.productCode && v.productCode.toLowerCase().includes(q))
    )
  })
})

const posPagination = reactive({
  page: 1,
  size: 8
})

const paginatedVariants = computed(() => {
  const start = (posPagination.page - 1) * posPagination.size
  return filteredVariants.value.slice(start, start + posPagination.size)
})

watch([debouncedSearchQuery, selectedSizeFilter, selectedColorFilter], () => {
  posPagination.page = 1
})

const totalCartQty = computed(() => cart.value.reduce((s, i) => s + Number(i.quantity || 0), 0))
const totalCartAmount = computed(() =>
  cart.value.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.variant.salePrice || 0), 0)
)

function onStepProductChange() {
  stepSizeId.value = availableSizesForStepProduct.value[0]?.sizeId || null
  onStepSizeChange()
}

function onStepSizeChange() {
  stepColorId.value = availableColorsForStep.value[0]?.colorId || null
}

function addVariantToCart(variant) {
  if (!variant || variant.availableQuantity <= 0) {
    ElMessage.warning('Biến thể này đã hết số lượng có sẵn')
    return
  }
  const existing = cart.value.find((x) => x.variant.id === variant.id)
  if (existing) {
    if (existing.quantity + 1 > variant.availableQuantity) {
      ElMessage.warning(`SKU ${variant.sku} chỉ còn tối đa ${variant.availableQuantity} đôi có sẵn`)
      return
    }
    existing.quantity += 1
  } else {
    cart.value.push({
      variant,
      quantity: 1
    })
  }
  ElMessage.success(`Đã thêm ${variant.sku} vào đơn hàng`)
}

async function loadCatalog() {
  loading.value = true
  try {
    const [vRes, pRes, sRes, cRes, custRes] = await Promise.all([
      variantService.getAllVariants(),
      productService.getAllProducts(),
      variantService.getSizes(),
      variantService.getColors(),
      customerService.getAllCustomers()
    ])
    variants.value = vRes.data || []
    products.value = pRes.data || []
    sizes.value = sRes.data || []
    colors.value = cRes.data || []
    customers.value = custRes.data || []
  } finally {
    loading.value = false
  }
}

function onQuickCustomerCreated(newCust) {
  customers.value.unshift(newCust)
  checkoutForm.customerId = newCust.id
}

async function submitSaleOrder() {
  if (cart.value.length === 0) return
  submitting.value = true
  try {
    const payload = {
      customerId: checkoutForm.customerId || null,
      paymentMethod: checkoutForm.paymentMethod,
      status: checkoutForm.status,
      paymentReference: checkoutForm.paymentReference || null,
      note: checkoutForm.note || 'Bán hàng trực tiếp tại quầy POS',
      items: cart.value.map((i) => ({
        productVariantId: i.variant.id,
        quantity: i.quantity
      }))
    }
    const res = await orderService.createSaleOrder(payload)
    createdOrder.value = res.data
    ElMessage.success(`Đã tạo đơn hàng ${createdOrder.value.orderCode} thành công!`)
    cart.value = []
    checkoutForm.note = ''
    checkoutForm.paymentReference = ''
    invoiceVisible.value = true
    await loadCatalog()
  } finally {
    submitting.value = false
  }
}

// --- AUDIO SYNTHESIZER FOR SCAN BEEP ---
const playScanBeep = (isSuccess = true) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (isSuccess) {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1400, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.12)
    } else {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(250, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.22)
    }
  } catch (e) {
    // Ignore audio error
  }
}

// --- BARCODE SCAN PROCESSOR ---
function handleBarcodeScanned() {
  const code = barcodeScanInput.value.trim()
  if (!code) return
  processScannedSku(code)
}

function processScannedSku(code) {
  if (!code) return
  const cleanCode = code.trim().toLowerCase()
  const matched = variants.value.find(
    (v) =>
      v.sku.toLowerCase() === cleanCode ||
      (v.barcode && v.barcode.toLowerCase() === cleanCode) ||
      String(v.id) === cleanCode ||
      (v.productCode && v.productCode.toLowerCase() === cleanCode)
  )

  if (matched) {
    if (matched.availableQuantity <= 0) {
      playScanBeep(false)
      ElMessage.error(`⚠️ Đôi ${matched.productName} (SKU: ${matched.sku}) đã hết hàng trong kho!`)
      return
    }
    addVariantToCart(matched)
    playScanBeep(true)
    barcodeScanInput.value = ''
    nextTick(() => {
      barcodeInputRef.value?.focus()
    })
  } else {
    playScanBeep(false)
    ElMessage.warning(`❌ Không tìm thấy mã vạch / SKU: "${code}". Vui lòng thử lại!`)
  }
}

// Global Hardware Scanner Listener
let barcodeBuffer = ''
let lastKeyTime = 0

function handleGlobalKeydown(e) {
  const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : ''
  if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
    return
  }

  const currentTime = Date.now()
  if (currentTime - lastKeyTime > 150) {
    barcodeBuffer = ''
  }
  lastKeyTime = currentTime

  if (e.key === 'Enter') {
    if (barcodeBuffer.length >= 3) {
      processScannedSku(barcodeBuffer)
      barcodeBuffer = ''
      e.preventDefault()
    }
  } else if (e.key.length === 1) {
    barcodeBuffer += e.key
  }
}

// --- CAMERA BARCODE SCANNER ---
let cameraAnimationId = null

async function openCameraScanner() {
  cameraScannerVisible.value = true
  cameraError.value = ''
  cameraFallbackInput.value = ''
  await nextTick()

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraError.value = 'Trình duyệt không hỗ trợ truy cập camera trực tiếp.'
      return
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    cameraStream.value = stream
    if (cameraVideoRef.value) {
      cameraVideoRef.value.srcObject = stream
      await cameraVideoRef.value.play()
      startCameraDetectionLoop()
    }
  } catch (err) {
    console.warn('Camera access error:', err)
    cameraError.value = 'Không thể mở Camera (Có thể do quyền bị từ chối hoặc máy không có camera).'
  }
}

function startCameraDetectionLoop() {
  if (!('BarcodeDetector' in window)) {
    return
  }

  try {
    const barcodeDetector = new window.BarcodeDetector({
      formats: ['code_128', 'qr_code', 'ean_13', 'code_39']
    })

    const detectFrame = async () => {
      if (!cameraScannerVisible.value || !cameraVideoRef.value) return
      try {
        if (cameraVideoRef.value.readyState >= 2) {
          const barcodes = await barcodeDetector.detect(cameraVideoRef.value)
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue
            if (rawValue) {
              processScannedSku(rawValue)
              closeCameraScanner()
              return
            }
          }
        }
      } catch (e) {
        // Frame error
      }
      cameraAnimationId = requestAnimationFrame(detectFrame)
    }

    detectFrame()
  } catch (e) {
    console.warn('BarcodeDetector init error:', e)
  }
}

function closeCameraScanner() {
  if (cameraAnimationId) {
    cancelAnimationFrame(cameraAnimationId)
    cameraAnimationId = null
  }
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((t) => t.stop())
    cameraStream.value = null
  }
  cameraScannerVisible.value = false
}

function handleCameraFallbackSubmit() {
  if (cameraFallbackInput.value.trim()) {
    processScannedSku(cameraFallbackInput.value.trim())
    cameraFallbackInput.value = ''
    closeCameraScanner()
  }
}

function printSingleVariant(row) {
  printBarcodeItems.value = [{
    sku: row.sku,
    productName: row.productName,
    sizeValue: row.sizeValue,
    colorName: row.colorName,
    salePrice: row.salePrice,
    brandName: row.brandName || 'SNEAKERHUB',
    printQuantity: 1
  }]
  printBarcodeVisible.value = true
}

onMounted(() => {
  loadCatalog()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  closeCameraScanner()
})
</script>

<style scoped lang="scss">
.selector-panel {
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  padding: 14px 16px;
  margin-bottom: 14px;
  .selector-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #000000;
    margin-bottom: 10px;
  }
  .step-match-info {
    margin-top: 10px;
    font-size: 12px;
    color: #525252;
  }
}

.pos-cart-card {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 12px;
    h3 {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #000000;
    }
  }

  .customer-box {
    background: #fafafa;
    padding: 14px;
    border-radius: 0;
    border: 1px solid #e5e5e5;
    .box-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 6px;
    }
    .cust-row {
      display: flex;
      gap: 8px;
    }
  }

  .cart-list {
    max-height: 290px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: 0;
      border: 1px solid #e5e5e5;
      background: #ffffff;

      .item-info {
        .item-title {
          font-size: 13px;
          font-weight: 800;
          color: #000000;
        }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #737373;
          margin: 4px 0;
          .avail {
            color: #10b981;
            font-weight: 700;
          }
        }
        .item-price {
          font-size: 12px;
        }
      }

      .item-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .checkout-section {
    border-top: 1px solid #e5e5e5;
    padding-top: 14px;

    .summary-totals {
      background: #000000;
      color: #ffffff;
      padding: 16px 18px;
      border-radius: 0;
      border: 1px solid #000000;
      margin-bottom: 12px;

      .row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #a1a1aa;
        margin-bottom: 4px;

        span:last-child {
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }
      }

      .final {
        border-top: 1px solid #27272a;
        padding-top: 10px;
        margin-top: 8px;
        font-size: 17px;
        font-weight: 900;
        color: #ffffff;

        span:last-child {
          color: #ffffff;
          font-size: 20px;
        }
      }
    }
  }
}

.pos-prod-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .pos-prod-thumb {
    width: 32px;
    height: 32px;
    border-radius: 0;
    object-fit: cover;
    border: 1px solid #e5e5e5;
    flex-shrink: 0;

    &.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #09090b;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
  }

  .pos-prod-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .pos-prod-title {
      font-size: 12px;
      font-weight: 700;
      color: #000000;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pos-prod-sub {
      font-size: 10px;
      color: #71717a;
      font-family: var(--font-mono);
    }
  }
}

.pos-attr-cell {
  display: flex;
  align-items: center;
  gap: 5px;

  .color-text {
    font-size: 11.5px;
    color: #27272a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.pos-add-btn {
  height: 26px;
  padding: 0 9px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #27272a;
    border-color: #27272a;
  }

  &:disabled {
    background: #f4f4f5;
    color: #a1a1aa;
    border-color: #e4e4e7;
    cursor: not-allowed;
  }
}

.pos-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e5e5e5;

  .pos-pagination-info {
    font-size: 11px;
    font-weight: 700;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    strong {
      color: #000000;
    }
  }
}

.pos-cust-btn {
  height: 32px;
  padding: 0 12px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:hover {
    background: #27272a;
    border-color: #27272a;
  }
}

.cart-delete-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #ef4444;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: #ef4444;
    color: #ffffff;
  }

  .el-icon {
    font-size: 13px;
  }
}

.pos-checkout-btn {
  width: 100%;
  height: 48px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #27272a;
    border-color: #27272a;
  }

  &:disabled {
    background: #e4e4e7;
    color: #a1a1aa;
    border-color: #e4e4e7;
    cursor: not-allowed;
  }
}

/* BARCODE SCANNER HERO BAR */
.pos-barcode-scanner-bar {
  background: #0f172a;
  color: #ffffff;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid #1e293b;

  .scanner-hero {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .scanner-badge-laser {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #38bdf8;

      .laser-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 8px #ef4444;
        animation: laserBlink 1.2s infinite;
      }

      .scanner-tip {
        font-size: 10px;
        font-weight: 500;
        color: #94a3b8;
        margin-left: auto;
      }
    }

    .scanner-row {
      display: flex;
      gap: 10px;
      align-items: center;

      .barcode-quick-input {
        flex: 1;

        :deep(.el-input__wrapper) {
          background: #1e293b;
          box-shadow: 0 0 0 1px #334155 inset;
          color: #ffffff;

          &.is-focus {
            box-shadow: 0 0 0 2px #38bdf8 inset;
          }

          input {
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.02em;

            &::placeholder {
              color: #64748b;
              font-weight: 500;
              font-size: 12.5px;
            }
          }
        }

        :deep(.el-input-group__append) {
          background: #38bdf8;
          border-color: #38bdf8;
          color: #0f172a;
          font-weight: 900;
          cursor: pointer;

          button {
            color: #0f172a;
            font-weight: 900;
          }
        }
      }

      .btn-camera-scan {
        height: 40px;
        font-weight: 800;
        white-space: nowrap;
      }
    }
  }
}

@keyframes laserBlink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

/* CAMERA SCANNER DIALOG */
.camera-scanner-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;

  .camera-viewport-wrap {
    position: relative;
    width: 100%;
    height: 280px;
    background: #000;
    overflow: hidden;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    .camera-feed {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .camera-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;

      .scanner-aim-frame {
        width: 260px;
        height: 160px;
        border: 2px solid #10b981;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);

        .laser-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: scanLineAnim 2s infinite ease-in-out;
        }
      }

      .camera-hint {
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        margin-top: 14px;
        text-align: center;
        padding: 0 16px;
      }
    }
  }

  .camera-err-msg {
    color: #ef4444;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .camera-manual-input {
    width: 100%;
  }
}

@keyframes scanLineAnim {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
</style>
