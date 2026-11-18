<template>
  <div class="store-order-success">
    <div class="layout-container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="!order" class="not-found-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-svg">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 class="state-title">Không tìm thấy thông tin đơn hàng</h2>
        <p class="state-desc">Vui lòng kiểm tra lại mã đơn hàng hoặc tra cứu tại trang Tra cứu đơn hàng.</p>
        <div class="state-actions">
          <router-link to="/tracking" class="btn-black">Đến trang tra cứu</router-link>
          <router-link to="/shop" class="btn-outline">Tiếp tục mua sắm</router-link>
        </div>
      </div>

      <div v-else class="receipt-container">
        <!-- Top Status Banner -->
        <div class="receipt-header">
          <div class="check-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-svg">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="eyebrow">ORDER CONFIRMED</span>
          <h1 class="headline">ĐẶT HÀNG THÀNH CÔNG</h1>
          <p class="order-code-prompt">
            Mã đơn hàng:
            <span class="order-code-badge" @click="copyOrderCode" title="Click để sao chép">
              {{ order.orderCode }}
              <span class="copy-glyph">📋</span>
            </span>
          </p>
          <p class="header-note">
            Đơn hàng đã được lưu trữ trên hệ thống và chuyển sang bộ phận kho để chuẩn bị đóng gói.
          </p>
        </div>

        <div class="receipt-grid">
          <!-- Left: Payment / Shipping -->
          <div class="receipt-left-col">
            <!-- VietQR Card if Bank Transfer -->
            <div v-if="order.paymentMethod === 'BANK_TRANSFER'" class="card-box qr-card">
              <div class="box-head">
                <span class="box-eyebrow">PAYMENT GATEWAY</span>
                <h3 class="box-title">THANH TOÁN CHUYỂN KHOẢN VIETQR</h3>
              </div>

              <div class="qr-layout">
                <div class="qr-media">
                  <img
                    v-if="order.qrPaymentUrl"
                    :src="order.qrPaymentUrl"
                    alt="VietQR"
                    class="vietqr-img"
                  />
                  <p class="qr-scan-hint">Mở app Ngân hàng để quét mã QR</p>
                </div>

                <div class="qr-specs">
                  <div class="spec-line">
                    <span class="lbl">Ngân hàng:</span>
                    <span class="val strong">MB Bank (Quân Đội)</span>
                  </div>
                  <div class="spec-line">
                    <span class="lbl">Chủ tài khoản:</span>
                    <span class="val strong">SNEAKERHUB PRO</span>
                  </div>
                  <div class="spec-line">
                    <span class="lbl">Số tài khoản:</span>
                    <span class="val code-val" @click="copyText('0901000001', 'Số tài khoản')">
                      0901000001 <span class="copy-hint">Sao chép</span>
                    </span>
                  </div>
                  <div class="spec-line">
                    <span class="lbl">Số tiền:</span>
                    <span class="val price-val">{{ formatCurrency(order.totalAmount) }}</span>
                  </div>
                  <div class="spec-line">
                    <span class="lbl">Nội dung CK:</span>
                    <span class="val code-val highlight" @click="copyText(order.orderCode, 'Nội dung chuyển khoản')">
                      {{ order.orderCode }} <span class="copy-hint">Sao chép</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="qr-warning">
                <span>⚠️ Lưu ý: Giữ nguyên nội dung chuyển khoản <strong>{{ order.orderCode }}</strong> để hệ thống tự động gạch nợ đơn hàng.</span>
              </div>
            </div>

            <!-- COD Card -->
            <div v-else class="card-box cod-card">
              <div class="box-head">
                <span class="box-eyebrow">PAYMENT METHOD</span>
                <h3 class="box-title">THANH TOÁN TIỀN MẶT KHI NHẬN HÀNG (COD)</h3>
              </div>
              <p class="cod-desc">
                Bạn sẽ thanh toán số tiền <strong>{{ formatCurrency(order.totalAmount) }}</strong> trực tiếp cho nhân viên giao hàng sau khi kiểm tra giày tận nơi.
              </p>
            </div>

            <!-- Shipping Details -->
            <div class="card-box shipping-card">
              <div class="box-head">
                <span class="box-eyebrow">DELIVERY INFO</span>
                <h3 class="box-title">THÔNG TIN GIAO HÀNG</h3>
              </div>

              <div class="info-rows">
                <div class="info-line">
                  <span class="lbl">Người nhận:</span>
                  <span class="val">{{ order.customerName }}</span>
                </div>
                <div class="info-line">
                  <span class="lbl">Số điện thoại:</span>
                  <span class="val">{{ order.customerPhone }}</span>
                </div>
                <div class="info-line">
                  <span class="lbl">Địa chỉ nhận:</span>
                  <span class="val">{{ order.shippingAddress }}</span>
                </div>
                <div class="info-line" v-if="order.note">
                  <span class="lbl">Ghi chú:</span>
                  <span class="val italic">{{ order.note }}</span>
                </div>
                <div class="info-line">
                  <span class="lbl">Thời gian đặt:</span>
                  <span class="val">{{ formatDate(order.orderDate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Items breakdown -->
          <div class="receipt-right-col">
            <div class="card-box items-summary-card">
              <div class="box-head">
                <span class="box-eyebrow">ORDER DETAILS</span>
                <h3 class="box-title">KIỆN HÀNG ({{ (order.items && order.items.length) || 0 }} ĐÔI)</h3>
              </div>

              <div class="order-items-scroll">
                <div
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="receipt-item-row"
                >
                  <img
                    :src="item.productImageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=150&q=80'"
                    :alt="item.productName"
                    class="item-thumb"
                  />
                  <div class="item-meta">
                    <h4 class="item-title">{{ item.productName }}</h4>
                    <div class="item-tags">
                      <span v-if="item.sizeValue" class="item-tag">Size: {{ item.sizeValue }}</span>
                      <span v-if="item.colorName" class="item-tag">{{ item.colorName }}</span>
                      <span class="item-qty">x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-cost">
                    {{ formatCurrency(item.unitPrice * item.quantity) }}
                  </div>
                </div>
              </div>

              <div class="order-totals-table">
                <div class="total-row-line">
                  <span>Tạm tính</span>
                  <span>{{ formatCurrency(order.totalAmount) }}</span>
                </div>
                <div class="total-row-line">
                  <span>Vận chuyển toàn quốc</span>
                  <span class="free-text">Miễn phí</span>
                </div>
                <div class="total-row-line grand-total">
                  <span>TỔNG THANH TOÁN</span>
                  <span class="grand-price">{{ formatCurrency(order.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="receipt-actions">
              <button class="btn-track-action" @click="goToTracking">
                TRA CỨU VẬN ĐƠN →
              </button>
              <button class="btn-shop-action" @click="router.push('/shop')">
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const order = ref(null)

onMounted(async () => {
  const code = route.params.orderCode

  // Check sessionStorage
  const cachedOrderStr = sessionStorage.getItem('last_placed_order')
  if (cachedOrderStr) {
    try {
      const cached = JSON.parse(cachedOrderStr)
      if (cached && (cached.orderCode === code || !code)) {
        order.value = cached
        loading.value = false
        return
      }
    } catch (e) {
      console.warn('Failed parsing cached order', e)
    }
  }

  // Otherwise, track order from API
  if (code) {
    try {
      const res = await storeService.trackOrder(code)
      if (res?.data) {
        order.value = res.data
      }
    } catch (err) {
      console.error('Không tìm thấy đơn hàng:', err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

const copyOrderCode = () => {
  if (!order.value?.orderCode) return
  copyText(order.value.orderCode, 'Mã đơn hàng')
}

const copyText = (text, label = 'Nội dung') => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`Đã sao chép ${label}!`)
  }).catch(() => {
    ElMessage.info(`Mã: ${text}`)
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Vừa xong'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

const goToTracking = () => {
  if (order.value?.orderCode) {
    router.push({
      path: '/tracking',
      query: { code: order.value.orderCode, phone: order.value.customerPhone }
    })
  } else {
    router.push('/tracking')
  }
}
</script>

<style scoped lang="scss">
.store-order-success {
  padding: 50px 0 100px;
  background: #ffffff;
}

.layout-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 28px;
}

.loading-state,
.not-found-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
  border: 1px dashed #e5e5e5;

  .empty-icon-wrap {
    margin-bottom: 16px;
    .empty-svg {
      width: 48px;
      height: 48px;
      color: #a3a3a3;
    }
  }

  .state-title {
    font-size: 20px;
    font-weight: 900;
    margin: 0 0 8px;
  }

  .state-desc {
    font-size: 14px;
    color: #737373;
    margin: 0 0 24px;
  }

  .state-actions {
    display: flex;
    justify-content: center;
    gap: 12px;

    .btn-black {
      background: #000000;
      color: #ffffff;
      padding: 12px 24px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-decoration: none;
    }

    .btn-outline {
      border: 1px solid #000000;
      color: #000000;
      padding: 12px 24px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-decoration: none;
    }
  }
}

/* Header */
.receipt-header {
  text-align: center;
  margin-bottom: 48px;

  .check-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #000000;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    .check-svg {
      width: 28px;
      height: 28px;
    }
  }

  .eyebrow {
    display: block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #737373;
    margin-bottom: 6px;
  }

  .headline {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #000000;
    margin: 0 0 10px;
  }

  .order-code-prompt {
    font-size: 15px;
    color: #525252;
    margin: 0 0 10px;

    .order-code-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #000000;
      color: #ffffff;
      padding: 4px 10px;
      font-family: monospace;
      font-weight: 800;
      cursor: pointer;
      margin-left: 6px;
      transition: background 0.15s ease;

      &:hover {
        background: #262626;
      }

      .copy-glyph {
        font-size: 12px;
      }
    }
  }

  .header-note {
    font-size: 13px;
    color: #737373;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.5;
  }
}

/* Grid */
.receipt-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 36px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
}

.card-box {
  background: #ffffff;
  border: 1px solid #ebebeb;
  padding: 24px;
  margin-bottom: 24px;

  .box-head {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 14px;
    margin-bottom: 18px;

    .box-eyebrow {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #737373;
      display: block;
      margin-bottom: 2px;
    }

    .box-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #000000;
      margin: 0;
    }
  }
}

/* QR Layout */
.qr-card {
  .qr-layout {
    display: flex;
    gap: 20px;
    align-items: center;

    @media (max-width: 500px) {
      flex-direction: column;
    }

    .qr-media {
      text-align: center;
      flex-shrink: 0;

      .vietqr-img {
        width: 160px;
        height: 160px;
        object-fit: contain;
        border: 1px solid #e5e5e5;
        padding: 4px;
        background: #ffffff;
      }

      .qr-scan-hint {
        font-size: 11px;
        color: #737373;
        margin: 6px 0 0;
      }
    }

    .qr-specs {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .spec-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .lbl {
          color: #737373;
        }

        .val {
          color: #000000;
          text-align: right;

          &.strong {
            font-weight: 700;
          }

          &.price-val {
            font-size: 15px;
            font-weight: 900;
            color: #000000;
          }

          &.code-val {
            font-family: monospace;
            font-weight: 800;
            background: #f5f5f5;
            padding: 2px 6px;
            cursor: pointer;
            transition: background 0.15s ease;

            .copy-hint {
              font-size: 10px;
              color: #737373;
              margin-left: 4px;
            }

            &:hover {
              background: #000000;
              color: #ffffff;
              .copy-hint {
                color: #d4d4d4;
              }
            }

            &.highlight {
              border: 1px solid #000000;
            }
          }
        }
      }
    }
  }

  .qr-warning {
    margin-top: 16px;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #e5e5e5;
    font-size: 11px;
    color: #525252;
    line-height: 1.4;
  }
}

.cod-card {
  .cod-desc {
    font-size: 13px;
    color: #525252;
    line-height: 1.6;
    margin: 0;
  }
}

.shipping-card {
  .info-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .info-line {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .lbl {
        color: #737373;
      }

      .val {
        color: #000000;
        font-weight: 600;
        text-align: right;
      }
    }
  }
}

/* Items Summary */
.items-summary-card {
  .order-items-scroll {
    max-height: 280px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;

    .receipt-item-row {
      display: flex;
      gap: 14px;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .item-thumb {
        width: 52px;
        height: 52px;
        background: #f5f5f7;
        border: 1px solid #e5e5e5;
        object-fit: contain;
        padding: 4px;
        flex-shrink: 0;
      }

      .item-meta {
        flex: 1;

        .item-title {
          font-size: 13px;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 4px;
        }

        .item-tags {
          display: flex;
          gap: 6px;
          align-items: center;

          .item-tag {
            font-size: 10px;
            font-weight: 700;
            background: #f5f5f5;
            padding: 1px 6px;
            color: #525252;
          }

          .item-qty {
            font-size: 11px;
            font-weight: 800;
            color: #000000;
          }
        }
      }

      .item-cost {
        font-size: 13px;
        font-weight: 800;
        color: #000000;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  .order-totals-table {
    border-top: 1px solid #ebebeb;
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .total-row-line {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #525252;

      .free-text {
        color: #10b981;
        font-weight: 800;
      }

      &.grand-total {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid #e5e5e5;
        font-size: 13px;
        font-weight: 900;
        color: #000000;
        letter-spacing: 0.06em;

        .grand-price {
          font-size: 18px;
          font-variant-numeric: tabular-nums;
        }
      }
    }
  }
}

.receipt-actions {
  display: flex;
  gap: 12px;

  .btn-track-action {
    flex: 1.2;
    height: 48px;
    background: #000000;
    color: #ffffff;
    border: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #262626;
    }
  }

  .btn-shop-action {
    flex: 1;
    height: 48px;
    background: transparent;
    border: 1px solid #000000;
    color: #000000;
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #f5f5f5;
    }
  }
}
</style>
