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
          <el-table :data="filteredVariants" stripe border height="440" style="width: 100%">
            <template #empty>
              <el-empty description="Không tìm thấy biến thể SKU phù hợp" :image-size="72" />
            </template>
            <el-table-column label="SKU" width="145">
              <template #default="{ row }">
                <span class="code-badge">{{ row.sku }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="Sản phẩm Sneaker" min-width="180" />
            <el-table-column label="Size / Màu" width="150">
              <template #default="{ row }">
                <el-tag size="small" type="warning" effect="plain" style="margin-right: 4px">
                  {{ row.sizeValue }}
                </el-tag>
                <span class="color-dot" :style="{ backgroundColor: row.hexCode }"></span>
                <span style="font-size: 12.5px">{{ row.colorName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Đơn giá bán" width="135" align="right">
              <template #default="{ row }">
                <span class="price-text">{{ formatCurrency(row.salePrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="SL sẵn có" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.availableQuantity > 0 ? 'success' : 'danger'" size="small">
                  {{ row.availableQuantity }} đôi
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Chọn" width="105" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  :disabled="row.availableQuantity <= 0"
                  @click="addVariantToCart(row)"
                >
                  + Chọn
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
              <el-button type="primary" plain @click="quickCustVisible = true">
                + Khách mới
              </el-button>
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
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="cart.splice(index, 1)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
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

            <el-button
              type="primary"
              size="large"
              style="width: 100%; font-weight: 800; height: 46px"
              :disabled="cart.length === 0"
              :loading="submitting"
              @click="submitSaleOrder"
            >
              XÁC NHẬN ĐƠN HÀNG &amp; XUẤT HÓA ĐƠN
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Quick Add Customer Modal -->
    <PosQuickCustomerDialog v-model="quickCustVisible" @created="onQuickCustomerCreated" />

    <!-- Printable Invoice Modal -->
    <InvoicePrintModal v-model="invoiceVisible" :order="createdOrder" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { variantService } from '@/services/variantService'
import { productService } from '@/services/productService'
import { customerService } from '@/services/customerService'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/formatters'
import { useDebouncedWatch } from '@/composables/useDebounce'
import InvoicePrintModal from '@/components/InvoicePrintModal.vue'
import PosQuickCustomerDialog from './components/PosQuickCustomerDialog.vue'

const loading = ref(false)
const submitting = ref(false)

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

onMounted(() => {
  loadCatalog()
})
</script>

<style scoped lang="scss">
.selector-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
  .selector-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }
  .step-match-info {
    margin-top: 8px;
    font-size: 12.5px;
    color: #334155;
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
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
    h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
  }

  .customer-box {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    .box-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
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
    gap: 10px;

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;

      .item-info {
        .item-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
        }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
          margin: 4px 0;
          .avail {
            color: #16a34a;
          }
        }
        .item-price {
          font-size: 12.5px;
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
    border-top: 2px solid #0f172a;
    padding-top: 14px;

    .summary-totals {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 12px;

      .row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 4px;
      }
      .final {
        border-top: 1px solid #334155;
        padding-top: 8px;
        margin-top: 6px;
        font-size: 16px;
        font-weight: 800;
        color: #f97316;
      }
    }
  }
}
</style>
