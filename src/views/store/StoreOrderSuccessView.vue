<template>
  <div class="store-order-success">
    <div class="store-container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="!order" class="not-found-state">
        <el-result
          icon="warning"
          title="Không tìm thấy thông tin đơn hàng"
          sub-title="Vui lòng kiểm tra lại mã đơn hàng hoặc tra cứu tại trang Tra cứu đơn hàng."
        >
          <template #extra>
            <el-button type="primary" @click="router.push('/tracking')">Đến trang tra cứu</el-button>
            <el-button @click="router.push('/shop')">Tiếp tục mua sắm</el-button>
          </template>
        </el-result>
      </div>

      <div v-else class="success-content">
        <!-- Top Status Banner -->
        <div class="success-header">
          <div class="icon-circle">
            <el-icon><Check /></el-icon>
          </div>
          <h1 class="headline">ĐẶT HÀNG THÀNH CÔNG!</h1>
          <p class="subtitle">
            Cảm ơn bạn đã tin tưởng SneakerHub. Mã đơn hàng của bạn là:
            <span class="order-code-badge" @click="copyOrderCode">
              {{ order.orderCode }}
              <el-icon><DocumentCopy /></el-icon>
            </span>
          </p>
          <p class="notification-text">
            Hệ thống đã ghi nhận đơn hàng và gửi thông báo xác nhận. Chúng tôi sẽ sớm liên hệ và giao hàng tới bạn!
          </p>
        </div>

        <div class="grid-layout">
          <!-- Left Column: Payment & Shipping Info -->
          <div class="info-column">
            <!-- VietQR Card if Bank Transfer -->
            <div v-if="order.paymentMethod === 'BANK_TRANSFER'" class="card qr-card">
              <div class="card-header">
                <h3>
                  <el-icon><CreditCard /></el-icon>
                  Thanh Toán Chuyển Khoản Qua VietQR
                </h3>
                <span class="badge-qr">Quét mã nhanh</span>
              </div>
              <div class="qr-body">
                <div class="qr-image-wrapper">
                  <img
                    v-if="order.qrPaymentUrl"
                    :src="order.qrPaymentUrl"
                    alt="Mã thanh toán VietQR"
                    class="qr-code-img"
                  />
                  <div v-else class="qr-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>Đang tạo mã VietQR...</span>
                  </div>
                  <p class="qr-scan-hint">Mở app Ngân hàng hoặc Ví MoMo để quét mã</p>
                </div>

                <div class="bank-details">
                  <div class="detail-row">
                    <span class="label">Ngân hàng:</span>
                    <span class="value strong">MB Bank (Quân Đội)</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Chủ tài khoản:</span>
                    <span class="value strong">SNEAKERHUB STORE</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Số tài khoản:</span>
                    <span class="value code-val" @click="copyText('0901000001', 'Số tài khoản')">
                      0901000001
                      <el-icon><CopyDocument /></el-icon>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Số tiền:</span>
                    <span class="value price">{{ formatCurrency(order.totalAmount) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Nội dung chuyển khoản:</span>
                    <span class="value code-val highlight" @click="copyText(order.orderCode, 'Nội dung chuyển tiền')">
                      {{ order.orderCode }}
                      <el-icon><CopyDocument /></el-icon>
                    </span>
                  </div>
                  <div class="qr-notice">
                    <el-icon><InfoFilled /></el-icon>
                    <span>Vui lòng giữ nguyên mã <b>{{ order.orderCode }}</b> trong nội dung chuyển khoản để hệ thống tự động gạch nợ.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- COD Notification if Cash -->
            <div v-else class="card cod-card">
              <div class="cod-body">
                <el-icon class="cod-icon"><Van /></el-icon>
                <div>
                  <h4>Phương thức: Thanh toán khi nhận hàng (COD)</h4>
                  <p>Bạn sẽ thanh toán số tiền <b>{{ formatCurrency(order.totalAmount) }}</b> trực tiếp cho nhân viên giao hàng khi nhận và kiểm tra giày.</p>
                </div>
              </div>
            </div>

            <!-- Customer & Shipping Card -->
            <div class="card shipping-card">
              <div class="card-header">
                <h3>
                  <el-icon><Location /></el-icon>
                  Thông Tin Nhận Hàng
                </h3>
              </div>
              <div class="shipping-body">
                <div class="info-row">
                  <span class="label">Họ và tên:</span>
                  <span class="value">{{ order.customerName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Số điện thoại:</span>
                  <span class="value">{{ order.customerPhone }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Địa chỉ giao:</span>
                  <span class="value">{{ order.shippingAddress }}</span>
                </div>
                <div v-if="order.note" class="info-row">
                  <span class="label">Ghi chú:</span>
                  <span class="value italic">{{ order.note }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Thời gian đặt:</span>
                  <span class="value">{{ formatDate(order.orderDate) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Trạng thái:</span>
                  <span class="status-badge" :class="order.status ? order.status.toLowerCase() : 'confirmed'">
                    {{ formatStatus(order.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Items & Summary -->
          <div class="items-column">
            <div class="card items-card">
              <div class="card-header">
                <h3>
                  <el-icon><Goods /></el-icon>
                  Kiện Hàng ({{ (order.items && order.items.length) || 0 }} sản phẩm)
                </h3>
              </div>
              <div class="items-list">
                <div
                  v-for="(item, index) in order.items"
                  :key="index"
                  class="item-row"
                >
                  <div class="item-img-wrap">
                    <img
                      :src="item.productImageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=150&q=80'"
                      :alt="item.productName"
                    />
                  </div>
                  <div class="item-meta">
                    <h4 class="item-name">{{ item.productName }}</h4>
                    <div class="item-chips">
                      <span v-if="item.sizeValue" class="chip">Size: {{ item.sizeValue }}</span>
                      <span v-if="item.colorName" class="chip">Màu: {{ item.colorName }}</span>
                      <span class="chip-qty">x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-price">
                    {{ formatCurrency(item.unitPrice * item.quantity) }}
                  </div>
                </div>
              </div>

              <div class="order-summary-box">
                <div class="summary-line">
                  <span>Tạm tính</span>
                  <span>{{ formatCurrency(order.totalAmount) }}</span>
                </div>
                <div class="summary-line">
                  <span>Phí vận chuyển toàn quốc</span>
                  <span class="free-ship">Miễn phí</span>
                </div>
                <div class="summary-line total-line">
                  <span>Tổng thanh toán</span>
                  <span class="total-price">{{ formatCurrency(order.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="action-buttons">
              <el-button
                size="large"
                type="primary"
                class="btn-track"
                @click="goToTracking"
              >
                <el-icon><Search /></el-icon>
                Theo Dõi Đơn Hàng
              </el-button>
              <el-button
                size="large"
                class="btn-shop"
                @click="router.push('/shop')"
              >
                <el-icon><ArrowLeft /></el-icon>
                Tiếp Tục Mua Sắm
              </el-button>
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
import {
  Check,
  DocumentCopy,
  CopyDocument,
  CreditCard,
  Picture,
  InfoFilled,
  Van,
  Location,
  Goods,
  Search,
  ArrowLeft
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const order = ref(null)

onMounted(async () => {
  const code = route.params.orderCode

  // Check sessionStorage first for instantaneous load
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

const formatStatus = (st) => {
  const map = {
    CONFIRMED: 'Đã xác nhận',
    PENDING: 'Chờ xử lý',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy'
  }
  return map[st] || st || 'Đã xác nhận'
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
  background: #f8fafc;
  min-height: calc(100vh - 80px);
  padding: 40px 0 80px;

  .store-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
  }
}

.loading-state,
.not-found-state {
  background: #fff;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.success-header {
  text-align: center;
  margin-bottom: 36px;

  .icon-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #10b981;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
    margin-bottom: 16px;
  }

  .headline {
    font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #0f172a;
    margin: 0 0 10px;
  }

  .subtitle {
    font-size: 16px;
    color: #475569;
    margin: 0 0 8px;

    .order-code-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0f172a;
      color: #fff;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
      margin-left: 6px;
      transition: all 0.2s;

      &:hover {
        background: #2563eb;
      }
    }
  }

  .notification-text {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    background: #fafafa;

    h3 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 18px;
        color: #2563eb;
      }
    }

    .badge-qr {
      background: #eff6ff;
      color: #2563eb;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
  }
}

.qr-card {
  border-color: #bfdbfe;

  .qr-body {
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .qr-image-wrapper {
      text-align: center;

      .qr-code-img {
        width: 210px;
        height: 210px;
        object-fit: contain;
        border-radius: 12px;
        border: 2px dashed #3b82f6;
        padding: 6px;
        background: #fff;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
      }

      .qr-placeholder {
        width: 210px;
        height: 210px;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 13px;
        gap: 8px;

        .el-icon {
          font-size: 36px;
        }
      }

      .qr-scan-hint {
        font-size: 12px;
        color: #64748b;
        margin: 8px 0 0;
        font-weight: 500;
      }
    }

    .bank-details {
      width: 100%;
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid #e2e8f0;

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px dashed #e2e8f0;
        font-size: 13px;

        &:last-of-type {
          border-bottom: none;
        }

        .label {
          color: #64748b;
        }

        .value {
          color: #0f172a;
          text-align: right;

          &.strong {
            font-weight: 700;
          }

          &.price {
            font-size: 16px;
            font-weight: 800;
            color: #ef4444;
          }

          &.code-val {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-family: monospace;
            font-weight: 700;
            background: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            cursor: pointer;
            transition: all 0.15s;

            &:hover {
              background: #2563eb;
              color: #fff;
              border-color: #2563eb;
            }

            &.highlight {
              color: #2563eb;
              border-color: #93c5fd;
              background: #eff6ff;
            }
          }
        }
      }

      .qr-notice {
        margin-top: 12px;
        padding: 8px 10px;
        background: #fffbeb;
        border-radius: 6px;
        border: 1px solid #fef3c7;
        font-size: 11px;
        color: #b45309;
        display: flex;
        align-items: flex-start;
        gap: 6px;

        .el-icon {
          font-size: 14px;
          margin-top: 1px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.cod-card {
  .cod-body {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    .cod-icon {
      font-size: 40px;
      color: #10b981;
      background: #ecfdf5;
      padding: 12px;
      border-radius: 12px;
    }

    h4 {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }
  }
}

.shipping-body {
  padding: 16px 20px;

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #64748b;
      min-width: 110px;
    }

    .value {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;

      &.confirmed {
        background: #dcfce7;
        color: #15803d;
      }
      &.pending {
        background: #fef3c7;
        color: #b45309;
      }
      &.completed {
        background: #eff6ff;
        color: #1d4ed8;
      }
      &.cancelled {
        background: #fee2e2;
        color: #b91c1c;
      }
    }
  }
}

.items-card {
  .items-list {
    padding: 12px 20px;
    max-height: 380px;
    overflow-y: auto;

    .item-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      .item-img-wrap {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-meta {
        flex: 1;

        .item-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .item-chips {
          display: flex;
          align-items: center;
          gap: 6px;

          .chip {
            font-size: 11px;
            background: #f1f5f9;
            color: #475569;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
          }

          .chip-qty {
            font-size: 11px;
            font-weight: 700;
            color: #2563eb;
          }
        }
      }

      .item-price {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }
    }
  }

  .order-summary-box {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 16px 20px;

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;

      .free-ship {
        color: #10b981;
        font-weight: 700;
      }

      &.total-line {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed #cbd5e1;
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;

        .total-price {
          font-size: 20px;
          color: #ef4444;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;

  .btn-track {
    flex: 1.2;
    background: #0f172a;
    border-color: #0f172a;
    font-weight: 700;
    height: 48px;

    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }

  .btn-shop {
    flex: 1;
    font-weight: 600;
    height: 48px;
  }
}
</style>
