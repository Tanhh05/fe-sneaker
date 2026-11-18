<template>
  <div class="store-track-order">
    <div class="layout-container">
      <!-- Search Box Card -->
      <div class="track-header-box">
        <span class="track-eyebrow">SHIPMENT TRACKING</span>
        <h1 class="track-headline">TRA CỨU HÀNH TRÌNH ĐƠN HÀNG</h1>
        <p class="track-subhead">
          Nhập mã đơn hàng (VD: HD0012) hoặc số điện thoại người nhận để kiểm tra trạng thái kiện hàng
        </p>

        <form class="track-form" @submit.prevent="handleSearch">
          <div class="input-wrap">
            <span class="input-lbl">MÃ ĐƠN HÀNG:</span>
            <input
              type="text"
              v-model="searchCode"
              placeholder="VD: HD0012..."
              class="track-input"
            />
          </div>

          <div class="input-wrap">
            <span class="input-lbl">SỐ ĐIỆN THOẠI (TÙY CHỌN):</span>
            <input
              type="text"
              v-model="searchPhone"
              placeholder="VD: 0987654321..."
              class="track-input"
            />
          </div>

          <button type="submit" class="btn-track-submit" :disabled="searching">
            <span v-if="searching">ĐANG TRA CỨU...</span>
            <span v-else>TRA CỨU VẬN ĐƠN →</span>
          </button>
        </form>
      </div>

      <!-- State: Loading -->
      <div v-if="searching" class="track-loading-box">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- State: Not Found -->
      <div v-else-if="hasSearched && !orderData" class="track-empty-box">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-svg">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3 class="empty-title">Không tìm thấy thông tin đơn hàng</h3>
        <p class="empty-desc">
          Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại bạn đã nhập. Nếu cần hỗ trợ khẩn cấp, vui lòng gọi hotline 1900 6868.
        </p>
        <button class="btn-reset-track" @click="resetSearch">Thử lại</button>
      </div>

      <!-- State: Order Result Found -->
      <div v-else-if="orderData" class="track-result-area">
        <!-- Top Summary Bar -->
        <div class="order-hero-card">
          <div class="order-meta-col">
            <span class="meta-label">MÃ ĐƠN HÀNG</span>
            <span class="meta-code">{{ orderData.orderCode }}</span>
          </div>
          <div class="order-meta-col">
            <span class="meta-label">NGÀY TẠO ĐƠN</span>
            <span class="meta-val">{{ formatDate(orderData.orderDate) }}</span>
          </div>
          <div class="order-meta-col">
            <span class="meta-label">PHƯƠNG THỨC</span>
            <span class="meta-val">{{ orderData.paymentMethod === 'BANK_TRANSFER' ? 'VietQR Chuyển khoản' : 'Thanh toán COD' }}</span>
          </div>
          <div class="order-status-badge" :class="orderData.status ? orderData.status.toLowerCase() : 'confirmed'">
            {{ formatStatus(orderData.status) }}
          </div>
        </div>

        <!-- Tracking Progress Stepper -->
        <div class="progress-box">
          <h3 class="progress-title">HÀNH TRÌNH KIỆN HÀNG</h3>
          <div class="progress-steps-row">
            <div
              v-for="(step, idx) in stepsList"
              :key="idx"
              class="step-item"
              :class="{
                completed: stepActiveIndex > idx + 1,
                active: stepActiveIndex === idx + 1,
                pending: stepActiveIndex < idx + 1
              }"
            >
              <div class="step-marker">
                <span v-if="stepActiveIndex > idx + 1">✓</span>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="step-text">
                <span class="step-name">{{ step.title }}</span>
                <span class="step-sub">{{ step.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="track-details-grid">
          <!-- Left: Shipping & Customer -->
          <div class="detail-panel">
            <h3 class="panel-heading">THÔNG TIN NHẬN HÀNG</h3>
            <div class="info-specs">
              <div class="spec-item">
                <span class="lbl">Họ tên:</span>
                <span class="val">{{ orderData.customerName }}</span>
              </div>
              <div class="spec-item">
                <span class="lbl">Số điện thoại:</span>
                <span class="val">{{ orderData.customerPhone }}</span>
              </div>
              <div class="spec-item">
                <span class="lbl">Địa chỉ:</span>
                <span class="val">{{ orderData.shippingAddress }}</span>
              </div>
              <div class="spec-item" v-if="orderData.note">
                <span class="lbl">Ghi chú:</span>
                <span class="val italic">{{ orderData.note }}</span>
              </div>
            </div>

            <!-- VietQR reminder if needed -->
            <div v-if="orderData.paymentMethod === 'BANK_TRANSFER' && orderData.qrPaymentUrl" class="qr-quick-box">
              <span class="qr-quick-title">MÃ VIETQR ĐƠN HÀNG NÀY</span>
              <div class="qr-flex">
                <img :src="orderData.qrPaymentUrl" alt="VietQR" class="qr-small" />
                <div class="qr-text">
                  <p>MB Bank: <strong>0901000001</strong></p>
                  <p>Nội dung: <strong>{{ orderData.orderCode }}</strong></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Items list -->
          <div class="detail-panel">
            <h3 class="panel-heading">SẢN PHẨM TRONG ĐƠN ({{ (orderData.items && orderData.items.length) || 0 }})</h3>
            <div class="order-items-table">
              <div
                v-for="(item, idx) in orderData.items"
                :key="idx"
                class="track-item-row"
              >
                <img
                  :src="item.productImageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=150&q=80'"
                  :alt="item.productName"
                  class="item-img"
                />
                <div class="item-meta">
                  <h4 class="item-name">{{ item.productName }}</h4>
                  <div class="item-tags">
                    <span v-if="item.sizeValue" class="tag">Size: {{ item.sizeValue }}</span>
                    <span v-if="item.colorName" class="tag">{{ item.colorName }}</span>
                    <span class="qty">x{{ item.quantity }}</span>
                  </div>
                </div>
                <div class="item-sum">
                  {{ formatCurrency(item.unitPrice * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="totals-bar">
              <div class="bar-line">
                <span>Tổng tiền hàng</span>
                <span>{{ formatCurrency(orderData.totalAmount) }}</span>
              </div>
              <div class="bar-line">
                <span>Vận chuyển</span>
                <span class="free">Miễn phí</span>
              </div>
              <div class="bar-line grand">
                <span>TỔNG THANH TOÁN</span>
                <span class="grand-num">{{ formatCurrency(orderData.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()

const searchCode = ref('')
const searchPhone = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const orderData = ref(null)

const stepsList = [
  { title: 'Tiếp nhận đơn', desc: 'Đơn hàng được ghi nhận' },
  { title: 'Xác nhận kho', desc: 'Kiểm tra & đóng gói' },
  { title: 'Đang vận chuyển', desc: 'Bàn giao đơn vị giao vận' },
  { title: 'Giao thành công', desc: 'Khách hàng nhận giày' }
]

const stepActiveIndex = computed(() => {
  if (!orderData.value) return 1
  const st = orderData.value.status
  if (st === 'COMPLETED') return 4
  if (st === 'CONFIRMED') return 2
  if (st === 'PENDING') return 1
  return 2
})

onMounted(() => {
  const code = route.query.code
  const phone = route.query.phone
  if (code) {
    searchCode.value = code
    if (phone) searchPhone.value = phone
    handleSearch()
  }
})

const handleSearch = async () => {
  if (!searchCode.value && !searchPhone.value) {
    ElMessage.warning('Vui lòng nhập mã đơn hàng hoặc số điện thoại để tra cứu')
    return
  }

  searching.value = true
  hasSearched.value = true
  try {
    const res = await storeService.trackOrder(searchCode.value.trim(), searchPhone.value.trim() || undefined)
    if (res?.data) {
      orderData.value = res.data
    } else {
      orderData.value = null
    }
  } catch (err) {
    console.error('Lỗi tra cứu đơn:', err)
    orderData.value = null
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  searchCode.value = ''
  searchPhone.value = ''
  hasSearched.value = false
  orderData.value = null
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
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
    CONFIRMED: 'ĐÃ XÁC NHẬN',
    PENDING: 'CHỜ THANH TOÁN',
    COMPLETED: 'HOÀN THÀNH',
    CANCELLED: 'ĐÃ HỦY'
  }
  return map[st] || st || 'ĐÃ XÁC NHẬN'
}
</script>

<style scoped lang="scss">
.store-track-order {
  padding: 50px 0 100px;
  background: #ffffff;
}

.layout-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 28px;
}

/* Header Form */
.track-header-box {
  background: #fafafa;
  border: 1px solid #ebebeb;
  padding: 40px;
  margin-bottom: 36px;

  .track-eyebrow {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #737373;
    display: block;
    margin-bottom: 6px;
  }

  .track-headline {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #000000;
    margin: 0 0 8px;
  }

  .track-subhead {
    font-size: 14px;
    color: #525252;
    margin: 0 0 28px;
  }

  .track-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 16px;
    align-items: flex-end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .input-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .input-lbl {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #000000;
      }

      .track-input {
        height: 44px;
        padding: 0 14px;
        border: 1px solid #e5e5e5;
        background: #ffffff;
        font-family: inherit;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s ease;

        &:focus {
          border-color: #000000;
        }
      }
    }

    .btn-track-submit {
      height: 44px;
      padding: 0 24px;
      background: #000000;
      color: #ffffff;
      border: none;
      font-family: inherit;
      font-size: 12px;
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
  }
}

/* Empty State */
.track-empty-box {
  text-align: center;
  padding: 80px 20px;
  border: 1px dashed #e5e5e5;
  background: #fafafa;

  .empty-icon-wrap {
    margin-bottom: 16px;
    .empty-svg {
      width: 48px;
      height: 48px;
      color: #a3a3a3;
    }
  }

  .empty-title {
    font-size: 20px;
    font-weight: 900;
    color: #000000;
    margin: 0 0 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: #737373;
    max-width: 480px;
    margin: 0 auto 24px;
    line-height: 1.5;
  }

  .btn-reset-track {
    background: #000000;
    color: #ffffff;
    border: none;
    padding: 12px 24px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
}

/* Tracking Result Area */
.track-result-area {
  .order-hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #000000;
    color: #ffffff;
    padding: 24px 30px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 20px;

    .order-meta-col {
      display: flex;
      flex-direction: column;

      .meta-label {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: #a3a3a3;
      }

      .meta-code {
        font-size: 18px;
        font-weight: 900;
        font-family: monospace;
        letter-spacing: 0.04em;
        margin-top: 2px;
      }

      .meta-val {
        font-size: 13px;
        font-weight: 600;
        margin-top: 2px;
      }
    }

    .order-status-badge {
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      background: #10b981;
      color: #ffffff;

      &.pending {
        background: #f59e0b;
      }
      &.cancelled {
        background: #ef4444;
      }
    }
  }

  /* Progress */
  .progress-box {
    background: #ffffff;
    border: 1px solid #ebebeb;
    padding: 28px 30px;
    margin-bottom: 24px;

    .progress-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #000000;
      text-transform: uppercase;
      margin: 0 0 24px;
    }

    .progress-steps-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      @media (max-width: 700px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .step-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        position: relative;

        .step-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #a3a3a3;
          flex-shrink: 0;
        }

        .step-text {
          display: flex;
          flex-direction: column;

          .step-name {
            font-size: 13px;
            font-weight: 800;
            color: #000000;
          }

          .step-sub {
            font-size: 11px;
            color: #737373;
            margin-top: 2px;
          }
        }

        &.completed {
          .step-marker {
            background: #000000;
            border-color: #000000;
            color: #ffffff;
          }
        }

        &.active {
          .step-marker {
            background: #ffffff;
            border-color: #000000;
            color: #000000;
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }
        }

        &.pending {
          opacity: 0.5;
        }
      }
    }
  }

  /* Grid */
  .track-details-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 24px;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
    }

    .detail-panel {
      background: #ffffff;
      border: 1px solid #ebebeb;
      padding: 24px;

      .panel-heading {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #000000;
        margin: 0 0 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .info-specs {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .spec-item {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding-bottom: 8px;
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

    .qr-quick-box {
      margin-top: 20px;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #e5e5e5;

      .qr-quick-title {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #737373;
        display: block;
        margin-bottom: 10px;
      }

      .qr-flex {
        display: flex;
        gap: 14px;
        align-items: center;

        .qr-small {
          width: 80px;
          height: 80px;
          border: 1px solid #e5e5e5;
          padding: 2px;
          background: #ffffff;
        }

        .qr-text {
          font-size: 12px;
          p {
            margin: 0 0 4px;
            color: #525252;
            strong {
              color: #000000;
            }
          }
        }
      }
    }

    .order-items-table {
      max-height: 260px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;

      .track-item-row {
        display: flex;
        gap: 12px;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-img {
          width: 48px;
          height: 48px;
          background: #f5f5f7;
          border: 1px solid #e5e5e5;
          object-fit: contain;
          padding: 3px;
          flex-shrink: 0;
        }

        .item-meta {
          flex: 1;

          .item-name {
            font-size: 13px;
            font-weight: 700;
            color: #0a0a0a;
            margin: 0 0 4px;
          }

          .item-tags {
            display: flex;
            gap: 6px;
            align-items: center;

            .tag {
              font-size: 10px;
              font-weight: 600;
              background: #f5f5f5;
              padding: 1px 6px;
              color: #525252;
            }

            .qty {
              font-size: 11px;
              font-weight: 800;
              color: #000000;
            }
          }
        }

        .item-sum {
          font-size: 13px;
          font-weight: 800;
          color: #000000;
          font-variant-numeric: tabular-nums;
        }
      }
    }

    .totals-bar {
      border-top: 1px solid #ebebeb;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .bar-line {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #525252;

        .free {
          color: #10b981;
          font-weight: 800;
        }

        &.grand {
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px solid #e5e5e5;
          font-size: 13px;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.04em;

          .grand-num {
            font-size: 16px;
            font-variant-numeric: tabular-nums;
          }
        }
      }
    }
  }
}
</style>
