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
                    :src="item.imageUrl || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80'"
                    :alt="item.productName"
                  />
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

              <el-form-item label="Địa chỉ nhận hàng chi tiết (*)" prop="shippingAddress">
                <el-input
                  v-model="form.shippingAddress"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                />
              </el-form-item>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const cartStore = useCartStore()

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  shippingAddress: '',
  paymentMethod: 'BANK_TRANSFER',
  note: ''
})

const rules = {
  customerName: [{ required: true, message: 'Vui lòng nhập họ tên người nhận', trigger: 'blur' }],
  customerPhone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không đúng định dạng', trigger: 'blur' }
  ],
  shippingAddress: [{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng', trigger: 'blur' }]
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

    submitting.value = true
    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || null,
        shippingAddress: form.shippingAddress,
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
