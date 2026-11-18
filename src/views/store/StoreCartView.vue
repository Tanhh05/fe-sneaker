<template>
  <div class="store-cart">
    <div class="container">
      <div class="cart-header">
        <h1 class="page-title">GIỎ HÀNG CỦA BẠN</h1>
        <p class="page-sub" v-if="cartStore.totalItems > 0">
          Bạn đang có <strong>{{ cartStore.totalItems }}</strong> sản phẩm trong giỏ hàng
        </p>
      </div>

      <!-- Empty Cart -->
      <div v-if="cartStore.items.length === 0" class="empty-cart-box">
        <div class="empty-icon">🛒</div>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy dạo quanh cửa hàng và chọn cho mình những đôi sneaker ưng ý nhất nhé!</p>
        <router-link to="/shop" class="btn-shop-now">TIẾP TỤC MUA SẮM</router-link>
      </div>

      <!-- Cart with items -->
      <div v-else class="cart-grid">
        <!-- Left: Items list -->
        <div class="cart-items-col">
          <div class="items-card">
            <div class="items-header">
              <span>SẢN PHẨM</span>
              <button class="btn-clear" @click="confirmClearCart">Xóa toàn bộ</button>
            </div>

            <div class="items-list">
              <div
                v-for="item in cartStore.items"
                :key="item.variantId"
                class="cart-item"
              >
                <div class="item-thumb">
                  <img :src="item.thumbnailUrl || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80'" :alt="item.productName" />
                </div>
                <div class="item-details">
                  <span class="item-brand">{{ item.brandName }}</span>
                  <h4 class="item-name">{{ item.productName }}</h4>
                  <div class="item-specs">
                    <span class="spec-pill">Size: <strong>{{ item.sizeValue }}</strong></span>
                    <span class="spec-pill">Màu: <strong>{{ item.colorName }}</strong></span>
                    <span class="spec-sku">SKU: {{ item.sku }}</span>
                  </div>
                  <div class="item-price-mobile">{{ formatCurrency(item.salePrice) }}</div>
                </div>

                <div class="item-price">
                  {{ formatCurrency(item.salePrice) }}
                </div>

                <div class="item-quantity">
                  <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="item.availableQuantity || 99"
                    size="small"
                    @change="(val) => cartStore.updateQuantity(item.variantId, val)"
                  />
                  <span class="stock-max">Tồn: {{ item.availableQuantity }}</span>
                </div>

                <div class="item-subtotal">
                  {{ formatCurrency(item.salePrice * item.quantity) }}
                </div>

                <button class="btn-remove" @click="cartStore.removeFromCart(item.variantId)" title="Xóa khỏi giỏ">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Checkout Box -->
        <div class="checkout-col">
          <div class="checkout-card">
            <h3 class="checkout-title">THÔNG TIN GIAO HÀNG & THANH TOÁN</h3>

            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
              <el-form-item label="Họ và tên người nhận (*)" prop="customerName">
                <el-input v-model="form.customerName" placeholder="Ví dụ: Nguyễn Văn A" />
              </el-form-item>

              <el-form-item label="Số điện thoại (*)" prop="customerPhone">
                <el-input v-model="form.customerPhone" placeholder="Ví dụ: 0912345678" />
              </el-form-item>

              <el-form-item label="Email (Nhận hóa đơn điện tử)" prop="customerEmail">
                <el-input v-model="form.customerEmail" placeholder="email@example.com" />
              </el-form-item>

              <el-form-item label="Địa chỉ nhận hàng chi tiết (*)" prop="shippingAddress">
                <el-input
                  v-model="form.shippingAddress"
                  type="textarea"
                  :rows="2"
                  placeholder="Số nhà, ngõ/ngách, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                />
              </el-form-item>

              <!-- Payment Method -->
              <el-form-item label="Phương thức thanh toán (*)">
                <el-radio-group v-model="form.paymentMethod" class="payment-radio-group">
                  <div class="pay-option" :class="{ active: form.paymentMethod === 'CASH' }">
                    <el-radio label="CASH">
                      <div class="pay-label">
                        <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                        <span>Kiểm tra hàng trước khi thanh toán cho shipper</span>
                      </div>
                    </el-radio>
                  </div>

                  <div class="pay-option" :class="{ active: form.paymentMethod === 'BANK_TRANSFER' }">
                    <el-radio label="BANK_TRANSFER">
                      <div class="pay-label">
                        <strong>📲 Chuyển khoản VietQR tự động</strong>
                        <span>Quét mã QR qua app ngân hàng tức thì</span>
                      </div>
                    </el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Ghi chú đơn hàng (nếu có)">
                <el-input v-model="form.note" placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao..." />
              </el-form-item>
            </el-form>

            <!-- Order Summary -->
            <div class="summary-box">
              <div class="summary-line">
                <span>Tạm tính hàng:</span>
                <span>{{ formatCurrency(cartStore.totalPrice) }}</span>
              </div>
              <div class="summary-line">
                <span>Phí vận chuyển:</span>
                <span class="free-ship">{{ cartStore.totalPrice >= 1000000 ? 'MIỄN PHÍ' : '30.000 đ' }}</span>
              </div>
              <div class="summary-total">
                <span>TỔNG THANH TOÁN:</span>
                <span class="total-amount">{{ formatCurrency(finalTotal) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              class="btn-submit-order"
              :disabled="submitting"
              @click="submitOrder"
            >
              <span v-if="!submitting">XÁC NHẬN ĐẶT HÀNG ({{ formatCurrency(finalTotal) }})</span>
              <span v-else>ĐANG XỬ LÝ ĐƠN HÀNG...</span>
            </button>
            <p class="privacy-note">
              🔒 Thông tin đơn hàng được bảo mật an toàn. Quý khách được quyền kiểm tra hàng trước khi thanh toán.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
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
  paymentMethod: 'CASH',
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
  ElMessageBox.confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ?', 'Xác nhận', {
    confirmButtonText: 'Xóa hết',
    cancelButtonText: 'Giữ lại',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
  })
}

const submitOrder = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
      return
    }

    if (cartStore.items.length === 0) {
      ElMessage.warning('Giỏ hàng trống!')
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
      const orderData = res.data && res.data.data

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
  padding: 40px 0 80px;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-header {
  margin-bottom: 30px;

  .page-title {
    font-size: 30px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 0 0 6px;
  }

  .page-sub {
    font-size: 14px;
    color: #64748b;
    margin: 0;

    strong {
      color: #f97316;
    }
  }
}

.empty-cart-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  max-width: 600px;
  margin: 40px auto;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
  }

  p {
    color: #64748b;
    font-size: 14.5px;
    margin-bottom: 24px;
  }

  .btn-shop-now {
    display: inline-block;
    background: #0f172a;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 28px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: #f97316;
    }
  }
}

.cart-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 36px;
  align-items: flex-start;
}

/* Items Col */
.cart-items-col {
  .items-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;

    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;

      .btn-clear {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .items-list {
      padding: 0 24px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1.8fr 1fr 1fr 1fr 30px;
      align-items: center;
      gap: 16px;
      padding: 20px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      .item-thumb {
        width: 80px;
        height: 80px;
        background: #f1f5f9;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-details {
        .item-brand {
          font-size: 11px;
          font-weight: 700;
          color: #f97316;
          text-transform: uppercase;
        }

        .item-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 2px 0 6px;
        }

        .item-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .spec-pill {
            background: #f1f5f9;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            color: #475569;
          }

          .spec-sku {
            font-size: 11px;
            color: #94a3b8;
          }
        }

        .item-price-mobile {
          display: none;
        }
      }

      .item-price {
        font-size: 14px;
        font-weight: 700;
        color: #64748b;
      }

      .item-quantity {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stock-max {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 4px;
        }
      }

      .item-subtotal {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        text-align: right;
      }

      .btn-remove {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;

        &:hover {
          color: #ef4444;
        }
      }
    }
  }
}

/* Checkout Col */
.checkout-col {
  .checkout-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    .checkout-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin: 0 0 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
    }

    .payment-radio-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pay-option {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      transition: all 0.2s;

      &.active {
        border-color: #f97316;
        background: #fff7ed;
      }

      .pay-label {
        display: flex;
        flex-direction: column;
        margin-left: 8px;

        strong {
          font-size: 13.5px;
          color: #0f172a;
        }

        span {
          font-size: 11.5px;
          color: #64748b;
          margin-top: 2px;
        }
      }
    }

    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;

      .summary-line {
        display: flex;
        justify-content: space-between;
        font-size: 13.5px;
        color: #64748b;
        margin-bottom: 8px;

        .free-ship {
          color: #10b981;
          font-weight: 700;
        }
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding-top: 10px;
        border-top: 1px dashed #cbd5e1;
        font-weight: 800;

        span {
          font-size: 14px;
          color: #0f172a;
        }

        .total-amount {
          font-size: 20px;
          color: #f97316;
        }
      }
    }

    .btn-submit-order {
      width: 100%;
      padding: 16px;
      background: #f97316;
      border: none;
      color: #ffffff;
      font-size: 15px;
      font-weight: 800;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #ea580c;
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .privacy-note {
      font-size: 11.5px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
      margin-top: 14px;
    }
  }
}

@media (max-width: 900px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
  .cart-item {
    grid-template-columns: 60px 1fr 30px !important;
  }
  .cart-item .item-price,
  .cart-item .item-subtotal {
    display: none;
  }
  .cart-item .item-price-mobile {
    display: block !important;
    font-size: 14px;
    font-weight: 700;
    color: #f97316;
    margin-top: 4px;
  }
}
</style>
