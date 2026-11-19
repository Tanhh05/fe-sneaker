<template>
  <div class="store-cart">
    <div class="layout-container">
      <div class="cart-header">
        <h1 class="cart-title">GIỎ HÀNG CỦA BẠN</h1>
        <p class="cart-subtitle" v-if="cartStore.items.length">
          Đang có <strong>{{ cartStore.totalItems }}</strong> sản phẩm được lưu trong giỏ
        </p>
      </div>

      <!-- Empty Cart State -->
      <div v-if="cartStore.items.length === 0" class="empty-cart-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-bag-svg">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h2 class="empty-heading">Giỏ hàng của bạn đang trống</h2>
        <p class="empty-text">Hãy khám phá bộ sưu tập những mẫu sneaker hot nhất và thêm đôi giày yêu thích vào giỏ hàng.</p>
        <router-link to="/shop" class="btn-continue-shopping">
          <span>KHÁM PHÁ BỘ SƯU TẬP</span>
          <span>→</span>
        </router-link>
      </div>

      <!-- Cart with Items -->
      <div v-else class="cart-grid">
        <!-- Left: Items list & Shipping details -->
        <div class="cart-main-col">
          <!-- Items Table -->
          <div class="section-box items-section">
            <div class="box-header">
              <h2 class="box-title">DANH SÁCH SẢN PHẨM</h2>
              <button class="btn-clear-bag" @click="confirmClearCart">Xóa toàn bộ</button>
            </div>

            <div class="cart-items-list">
              <div
                v-for="item in cartStore.items"
                :key="item.variantId"
                class="cart-item-row"
              >
                <div class="item-visual" @click="router.push(`/product/${item.productId}`)">
                  <img
                    v-if="item.thumbnailUrl || item.imageUrl || (item.imageUrls && item.imageUrls[0])"
                    :src="item.thumbnailUrl || item.imageUrl || (item.imageUrls && item.imageUrls[0])"
                    :alt="item.productName"
                  />
                  <div v-else class="item-visual-placeholder">
                    <span>SNK</span>
                  </div>
                </div>

                <div class="item-content">
                  <div class="item-top">
                    <span class="item-brand">{{ item.brandName }}</span>
                    <button class="item-remove-btn" @click="cartStore.removeFromCart(item.variantId)" title="Xóa">✕</button>
                  </div>
                  <h3 class="item-name" @click="router.push(`/product/${item.productId}`)">{{ item.productName }}</h3>

                  <div class="item-variants-pills">
                    <span v-if="item.sizeValue" class="variant-pill">Size: {{ item.sizeValue }}</span>
                    <span v-if="item.colorName" class="variant-pill">{{ item.colorName }}</span>
                    <span v-if="item.sku" class="sku-pill">{{ item.sku }}</span>
                  </div>

                  <div class="item-bottom-bar">
                    <div class="item-stepper">
                      <button class="step-btn" @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)">−</button>
                      <span class="step-val">{{ item.quantity }}</span>
                      <button class="step-btn" @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)">+</button>
                    </div>

                    <div class="item-price-block">
                      <span class="unit-price" v-if="item.quantity > 1">{{ formatCurrency(item.salePrice) }} / đôi</span>
                      <span class="total-item-price">{{ formatCurrency(item.salePrice * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer & Delivery Form -->
          <div class="section-box shipping-section">
            <div class="box-header">
              <h2 class="box-title">THÔNG TIN NHẬN HÀNG</h2>
            </div>

            <!-- Customer Member Status Banner -->
            <div v-if="!authStore.isAuthenticated" class="auth-suggest-banner">
              <div class="banner-text">
                <strong>Bạn đã có tài khoản thành viên?</strong>
                <span>Đăng nhập hoặc tiếp tục bằng Google để tự động điền thông tin và theo dõi đơn hàng.</span>
              </div>
              <button class="banner-login-btn" type="button" @click="authModalVisible = true">
                ĐĂNG NHẬP / GOOGLE &rarr;
              </button>
            </div>
            <div v-else class="auth-suggest-banner logged-in">
              <div class="banner-text">
                <strong>Thành viên: {{ authStore.user?.fullName || authStore.user?.username }}</strong>
                <span>Thông tin giao hàng đã được liên kết tự động với tài khoản của bạn.</span>
              </div>
              <span class="member-tag">✓ ĐÃ ĐĂNG NHẬP</span>
            </div>

            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              class="checkout-form"
            >
              <div class="form-row-2">
                <el-form-item label="Họ và tên người nhận (*)" prop="customerName">
                  <el-input v-model="form.customerName" placeholder="VD: Nguyễn Văn A" />
                </el-form-item>
                <el-form-item label="Số điện thoại (*)" prop="customerPhone">
                  <el-input v-model="form.customerPhone" placeholder="VD: 0912345678" />
                </el-form-item>
              </div>

              <!-- TỈNH / THÀNH PHỐ, QUẬN / HUYỆN, PHƯỜNG / XÃ (VIETNAM API) -->
              <div class="form-row-3 address-cascade-row">
                <el-form-item label="Tỉnh / Thành phố (*)" prop="provinceCode">
                  <el-select
                    v-model="form.provinceCode"
                    placeholder="Chọn Tỉnh / TP"
                    filterable
                    clearable
                    :loading="loadingProvinces"
                    style="width: 100%"
                    @change="handleProvinceChange"
                  >
                    <el-option
                      v-for="p in provinces"
                      :key="p.code"
                      :label="p.name"
                      :value="p.code"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="Quận / Huyện (*)" prop="districtCode">
                  <el-select
                    v-model="form.districtCode"
                    placeholder="Chọn Quận / Huyện"
                    filterable
                    clearable
                    :disabled="!form.provinceCode"
                    :loading="loadingDistricts"
                    style="width: 100%"
                    @change="handleDistrictChange"
                  >
                    <el-option
                      v-for="d in districts"
                      :key="d.code"
                      :label="d.name"
                      :value="d.code"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="Phường / Xã (*)" prop="wardCode">
                  <el-select
                    v-model="form.wardCode"
                    placeholder="Chọn Phường / Xã"
                    filterable
                    clearable
                    :disabled="!form.districtCode"
                    :loading="loadingWards"
                    style="width: 100%"
                    @change="handleWardChange"
                  >
                    <el-option
                      v-for="w in wards"
                      :key="w.code"
                      :label="w.name"
                      :value="w.code"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <!-- SỐ NHÀ, TÊN ĐƯỜNG CỤ THỂ -->
              <el-form-item label="Số nhà, tên đường, tòa nhà (*)" prop="streetAddress">
                <el-input
                  v-model="form.streetAddress"
                  placeholder="VD: Số 45 Ngõ 12 Đường Cầu Giấy, Tòa Landmark..."
                  @input="updateFullShippingAddress"
                />
              </el-form-item>

              <!-- LIVE FORMATTED ADDRESS PREVIEW -->
              <div v-if="formattedShippingAddress" class="address-preview-banner">
                <span class="preview-icon">📍</span>
                <div class="preview-content">
                  <span class="preview-label">Địa chỉ nhận hàng hoàn chỉnh:</span>
                  <strong class="preview-address">{{ formattedShippingAddress }}</strong>
                </div>
              </div>

              <div class="form-row-2">
                <el-form-item label="Email (để nhận hóa đơn & vận đơn)" prop="customerEmail">
                  <el-input v-model="form.customerEmail" placeholder="VD: example@email.com" />
                </el-form-item>
                <el-form-item label="Ghi chú giao hàng (tùy chọn)" prop="note">
                  <el-input v-model="form.note" placeholder="VD: Giao trong giờ hành chính, gọi trước khi giao..." />
                </el-form-item>
              </div>

              <!-- Payment Method Selection -->
              <div class="payment-selection">
                <label class="payment-title">HÌNH THỨC THANH TOÁN</label>
                <div class="payment-cards">
                  <div
                    class="payment-option-card"
                    :class="{ active: form.paymentMethod === 'BANK_TRANSFER' }"
                    @click="form.paymentMethod = 'BANK_TRANSFER'"
                  >
                    <div class="card-radio"></div>
                    <div class="card-text">
                      <div class="card-headline">
                        <strong>Chuyển khoản VietQR</strong>
                        <span class="recommend-tag">KHUYÊN DÙNG</span>
                      </div>
                      <p>Quét mã QR tự động qua ứng dụng ngân hàng hoặc MoMo. Gạch nợ đơn hàng lập tức.</p>
                    </div>
                  </div>

                  <div
                    class="payment-option-card"
                    :class="{ active: form.paymentMethod === 'CASH' }"
                    @click="form.paymentMethod = 'CASH'"
                  >
                    <div class="card-radio"></div>
                    <div class="card-text">
                      <div class="card-headline">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                      </div>
                      <p>Thanh toán tiền mặt cho bưu tá khi nhận giày và kiểm tra sản phẩm tận tay.</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </div>

        <!-- Right: Sticky Order Summary -->
        <aside class="cart-summary-col">
          <div class="summary-card">
            <h2 class="summary-heading">TÓM TẮT ĐƠN HÀNG</h2>

            <div class="summary-calc-rows">
              <div class="calc-row">
                <span class="calc-label">Tạm tính ({{ cartStore.totalItems }} đôi):</span>
                <span class="calc-val">{{ formatCurrency(cartStore.totalPrice) }}</span>
              </div>

              <div class="calc-row">
                <span class="calc-label">Phí vận chuyển:</span>
                <span class="calc-val" :class="{ 'free': cartStore.totalPrice >= 1000000 }">
                  {{ cartStore.totalPrice >= 1000000 ? 'MIỄN PHÍ' : '30.000₫' }}
                </span>
              </div>

              <div class="freeship-notice" v-if="cartStore.totalPrice < 1000000">
                <span>Mua thêm <strong>{{ formatCurrency(1000000 - cartStore.totalPrice) }}</strong> để được <strong>FREESHIP</strong> toàn quốc!</span>
              </div>

              <div class="calc-row total-row">
                <span class="total-lbl">TỔNG THANH TOÁN:</span>
                <span class="total-price">{{ formatCurrency(finalTotal) }}</span>
              </div>
            </div>

            <button
              class="btn-place-order"
              :disabled="submitting"
              @click="submitOrder"
            >
              <span v-if="submitting">ĐANG XỬ LÝ ĐƠN HÀNG...</span>
              <span v-else>XÁC NHẬN ĐẶT HÀNG →</span>
            </button>

            <div class="guarantee-points">
              <div class="point-item">
                <span class="point-dot">•</span>
                <span>Kiểm tra hàng trước khi thanh toán</span>
              </div>
              <div class="point-item">
                <span class="point-dot">•</span>
                <span>Hỗ trợ đổi size trong 7 ngày</span>
              </div>
              <div class="point-item">
                <span class="point-dot">•</span>
                <span>Bảo mật 100% thông tin giao dịch</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Client Auth Modal -->
    <ClientAuthModal v-model="authModalVisible" @authenticated="fillCustomerFromAuth" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import storeService from '@/services/storeService'
import vnAddressService from '@/services/vnAddressService'
import { formatCurrency } from '@/utils/formatters'
import ClientAuthModal from '@/components/store/ClientAuthModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const authModalVisible = ref(false)

const formRef = ref(null)
const submitting = ref(false)

// Administrative division states (API)
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const loadingProvinces = ref(false)
const loadingDistricts = ref(false)
const loadingWards = ref(false)

const form = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  provinceCode: null,
  districtCode: null,
  wardCode: null,
  provinceName: '',
  districtName: '',
  wardName: '',
  streetAddress: '',
  shippingAddress: '',
  paymentMethod: 'BANK_TRANSFER',
  note: ''
})

// Formatted full address preview
const formattedShippingAddress = computed(() => {
  const parts = []
  if (form.streetAddress && form.streetAddress.trim()) {
    parts.push(form.streetAddress.trim())
  }
  if (form.wardName) parts.push(form.wardName)
  if (form.districtName) parts.push(form.districtName)
  if (form.provinceName) parts.push(form.provinceName)
  return parts.join(', ')
})

const updateFullShippingAddress = () => {
  form.shippingAddress = formattedShippingAddress.value
}

// Fetch Vietnam provinces on mount
const loadProvinces = async () => {
  loadingProvinces.value = true
  try {
    provinces.value = await vnAddressService.getProvinces()
  } catch (err) {
    console.error('Lỗi khi tải danh sách Tỉnh/Thành phố:', err)
  } finally {
    loadingProvinces.value = false
  }
}

// Cascade handlers
const handleProvinceChange = async (val) => {
  form.districtCode = null
  form.wardCode = null
  form.districtName = ''
  form.wardName = ''
  districts.value = []
  wards.value = []

  const selected = provinces.value.find(p => p.code === val)
  form.provinceName = selected ? selected.name : ''
  updateFullShippingAddress()

  if (val) {
    loadingDistricts.value = true
    try {
      districts.value = await vnAddressService.getDistricts(val)
    } catch (err) {
      console.error('Lỗi tải danh sách Quận/Huyện:', err)
    } finally {
      loadingDistricts.value = false
    }
  }
}

const handleDistrictChange = async (val) => {
  form.wardCode = null
  form.wardName = ''
  wards.value = []

  const selected = districts.value.find(d => d.code === val)
  form.districtName = selected ? selected.name : ''
  updateFullShippingAddress()

  if (val) {
    loadingWards.value = true
    try {
      wards.value = await vnAddressService.getWards(val)
    } catch (err) {
      console.error('Lỗi tải danh sách Phường/Xã:', err)
    } finally {
      loadingWards.value = false
    }
  }
}

const handleWardChange = (val) => {
  const selected = wards.value.find(w => w.code === val)
  form.wardName = selected ? selected.name : ''
  updateFullShippingAddress()
}

const fillCustomerFromAuth = () => {
  if (authStore.isAuthenticated && authStore.user) {
    if (authStore.user.fullName && !form.customerName) form.customerName = authStore.user.fullName
    if (authStore.user.phone && !form.customerPhone) form.customerPhone = authStore.user.phone
    if (authStore.user.email && !form.customerEmail) form.customerEmail = authStore.user.email
    if (authStore.user.address && !form.streetAddress && !form.provinceCode) {
      form.streetAddress = authStore.user.address
      form.shippingAddress = authStore.user.address
    }
  }
}

const enrichCartThumbnails = async () => {
  let changed = false
  for (const item of cartStore.items) {
    if ((!item.thumbnailUrl && !item.imageUrl) && item.productId) {
      try {
        const res = await storeService.getProductDetail(item.productId)
        const p = res?.data
        const img = p?.thumbnailUrl || (p?.imageUrls && p.imageUrls[0]) || ''
        if (img) {
          item.thumbnailUrl = img
          item.imageUrl = img
          changed = true
        }
      } catch (err) {
        console.error('Không thể đồng bộ ảnh sản phẩm:', item.productId, err)
      }
    }
  }
  if (changed) {
    localStorage.setItem('sneakerhub_cart', JSON.stringify(cartStore.items))
  }
}

onMounted(() => {
  loadProvinces()
  fillCustomerFromAuth()
  enrichCartThumbnails()
})

watch(() => authStore.isAuthenticated, () => {
  fillCustomerFromAuth()
})

const rules = {
  customerName: [{ required: true, message: 'Vui lòng nhập họ tên người nhận', trigger: 'blur' }],
  customerPhone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không đúng định dạng', trigger: 'blur' }
  ],
  provinceCode: [{ required: true, message: 'Vui lòng chọn Tỉnh / Thành phố', trigger: 'change' }],
  districtCode: [{ required: true, message: 'Vui lòng chọn Quận / Huyện', trigger: 'change' }],
  wardCode: [{ required: true, message: 'Vui lòng chọn Phường / Xã', trigger: 'change' }],
  streetAddress: [{ required: true, message: 'Vui lòng nhập số nhà, tên đường cụ thể', trigger: 'blur' }]
}

const finalTotal = computed(() => {
  const shipFee = cartStore.totalPrice >= 1000000 ? 0 : 30000
  return cartStore.totalPrice + shipFee
})

const confirmClearCart = () => {
  ElMessageBox.confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?', 'Xác nhận', {
    confirmButtonText: 'Xóa giỏ',
    cancelButtonText: 'Hủy',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
  })
}

const submitOrder = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('Vui lòng điền đầy đủ các thông tin nhận hàng bắt buộc (*)')
      return
    }

    if (cartStore.items.length === 0) {
      ElMessage.warning('Giỏ hàng của bạn đang trống!')
      return
    }

    updateFullShippingAddress()
    const finalAddress = formattedShippingAddress.value || form.shippingAddress

    submitting.value = true
    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || null,
        shippingAddress: finalAddress,
        provinceName: form.provinceName || null,
        districtName: form.districtName || null,
        wardName: form.wardName || null,
        streetAddress: form.streetAddress || null,
        paymentMethod: form.paymentMethod,
        note: form.note || null,
        items: cartStore.items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      }

      const res = await storeService.checkout(payload)
      const orderData = res?.data

      // Save order details to sessionStorage for success page
      sessionStorage.setItem('last_placed_order', JSON.stringify(orderData))

      // Clear cart
      cartStore.clearCart()

      ElMessage.success('Đặt hàng thành công!')
      router.push(`/order-success/${orderData.orderCode}`)
    } catch (err) {
      console.error('Lỗi đặt hàng:', err)
      const msg = (err.response && err.response.data && err.response.data.message) || 'Có lỗi xảy ra khi tạo đơn hàng'
      ElMessage.error(msg)
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.store-cart {
  padding: 40px 0 90px;
  background: #ffffff;
}

.layout-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

.cart-header {
  margin-bottom: 36px;

  .cart-title {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #000000;
    margin: 0 0 6px;
  }

  .cart-subtitle {
    font-size: 14px;
    color: #737373;
    margin: 0;
  }
}

/* Empty State */
.empty-cart-state {
  text-align: center;
  padding: 100px 20px;
  background: #fafafa;
  border: 1px dashed #e5e5e5;

  .empty-icon-wrap {
    margin-bottom: 20px;
    .empty-bag-svg {
      width: 56px;
      height: 56px;
      color: #a3a3a3;
    }
  }

  .empty-heading {
    font-size: 22px;
    font-weight: 900;
    color: #000000;
    margin: 0 0 8px;
  }

  .empty-text {
    font-size: 14px;
    color: #737373;
    max-width: 440px;
    margin: 0 auto 28px;
    line-height: 1.5;
  }

  .btn-continue-shopping {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #000000;
    color: #ffffff;
    padding: 14px 28px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: background 0.15s ease;

    &:hover {
      background: #262626;
    }
  }
}

/* Cart Grid */
.cart-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 48px;
  align-items: flex-start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

.section-box {
  background: #ffffff;
  border: 1px solid #ebebeb;
  padding: 28px;
  margin-bottom: 28px;

  @media (max-width: 600px) {
    padding: 18px 14px;
    margin-bottom: 20px;
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid #ebebeb;
    margin-bottom: 20px;

    .box-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #000000;
      margin: 0;
    }

    .btn-clear-bag {
      background: none;
      border: none;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      color: #737373;
      text-decoration: underline;
      cursor: pointer;
      &:hover {
        color: #ef4444;
      }
    }
  }
}

.auth-suggest-banner {
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &.logged-in {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .banner-text {
    display: flex;
    flex-direction: column;
    gap: 3px;

    strong {
      font-size: 13px;
      font-weight: 800;
      color: #000000;
    }

    span {
      font-size: 12px;
      color: #52525b;
    }
  }

  .banner-login-btn {
    height: 34px;
    padding: 0 14px;
    background: #000000;
    color: #ffffff;
    border: 1px solid #000000;
    border-radius: 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      background: #27272a;
    }
  }

  .member-tag {
    font-size: 11px;
    font-weight: 800;
    color: #16a34a;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
}

/* Items List */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .cart-item-row {
    display: flex;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .item-visual {
      width: 100px;
      height: 100px;
      background: #f5f5f7;
      border: 1px solid #ebebeb;
      padding: 6px;
      flex-shrink: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .item-visual-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        color: #94a3b8;
        font-weight: 800;
        font-size: 13px;
      }
    }

    .item-content {
      flex: 1;

      .item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .item-brand {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #737373;
          text-transform: uppercase;
        }

        .item-remove-btn {
          background: none;
          border: none;
          color: #a3a3a3;
          font-size: 13px;
          cursor: pointer;
          &:hover {
            color: #000000;
          }
        }
      }

      .item-name {
        font-size: 15px;
        font-weight: 800;
        color: #0a0a0a;
        margin: 0 0 8px;
        line-height: 1.3;
        cursor: pointer;
        &:hover {
          color: #525252;
        }
      }

      .item-variants-pills {
        display: flex;
        gap: 6px;
        margin-bottom: 14px;

        .variant-pill {
          font-size: 11px;
          font-weight: 700;
          background: #f5f5f5;
          padding: 2px 8px;
          color: #262626;
        }

        .sku-pill {
          font-size: 10px;
          font-family: monospace;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          padding: 2px 6px;
          color: #737373;
        }
      }

      .item-bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-stepper {
          display: flex;
          align-items: center;
          border: 1px solid #e5e5e5;

          .step-btn {
            width: 30px;
            height: 30px;
            background: none;
            border: none;
            font-size: 15px;
            cursor: pointer;
            &:hover {
              background: #f5f5f5;
            }
          }

          .step-val {
            width: 30px;
            text-align: center;
            font-size: 12px;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
          }
        }

        .item-price-block {
          text-align: right;

          .unit-price {
            font-size: 11px;
            color: #737373;
            display: block;
          }

          .total-item-price {
            font-size: 15px;
            font-weight: 900;
            color: #000000;
            font-variant-numeric: tabular-nums;
          }
        }
      }
    }
  }
}

/* Shipping Form */
.checkout-form {
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .form-row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }

  .address-preview-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #000000;
    margin-bottom: 22px;

    .preview-icon {
      font-size: 18px;
      line-height: 1;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .preview-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
      }

      .preview-address {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.4;
      }
    }
  }

  .payment-selection {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #ebebeb;

    .payment-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #000000;
      text-transform: uppercase;
      display: block;
      margin-bottom: 12px;
    }

    .payment-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .payment-option-card {
        display: flex;
        gap: 14px;
        padding: 16px 18px;
        border: 1px solid #e5e5e5;
        background: #fafafa;
        cursor: pointer;
        transition: all 0.15s ease;

        .card-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #a3a3a3;
          margin-top: 2px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-headline {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;

          strong {
            font-size: 14px;
            font-weight: 800;
            color: #000000;
          }

          .recommend-tag {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.08em;
            background: #000000;
            color: #ffffff;
            padding: 2px 6px;
          }
        }

        p {
          font-size: 12px;
          color: #737373;
          margin: 0;
          line-height: 1.4;
        }

        &:hover {
          border-color: #737373;
        }

        &.active {
          border-color: #000000;
          background: #ffffff;

          .card-radio {
            border-color: #000000;
            background: #000000;
            box-shadow: inset 0 0 0 3px #ffffff;
          }
        }
      }
    }
  }
}

/* Order Summary Box */
.summary-card {
  position: sticky;
  top: 96px;
  background: #fafafa;
  border: 1px solid #ebebeb;
  padding: 30px 28px;

  @media (max-width: 600px) {
    padding: 20px 16px;
    position: static;
  }

  .summary-heading {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #000000;
    margin: 0 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5e5;
  }

  .summary-calc-rows {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 28px;

    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #525252;

      .calc-val {
        font-weight: 700;
        color: #000000;
        font-variant-numeric: tabular-nums;

        &.free {
          color: #10b981;
          font-weight: 800;
        }
      }

      &.total-row {
        margin-top: 10px;
        padding-top: 16px;
        border-top: 1px solid #e5e5e5;
        align-items: baseline;

        .total-lbl {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #000000;
        }

        .total-price {
          font-size: 24px;
          font-weight: 900;
          color: #000000;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
      }
    }

    .freeship-notice {
      background: #ffffff;
      border: 1px solid #e5e5e5;
      padding: 10px 12px;
      font-size: 11px;
      color: #525252;
      line-height: 1.4;

      strong {
        color: #000000;
      }
    }
  }

  .btn-place-order {
    width: 100%;
    height: 52px;
    background: #000000;
    color: #ffffff;
    border: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover:not(:disabled) {
      background: #262626;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .guarantee-points {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .point-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #737373;

      .point-dot {
        font-size: 14px;
        color: #000000;
      }
    }
  }
}
</style>
