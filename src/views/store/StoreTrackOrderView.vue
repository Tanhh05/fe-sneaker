<template>
  <div class="store-track-order">
    <div class="store-container">
      <!-- Search Box Card -->
      <div class="track-search-card">
        <div class="search-header">
          <div class="header-icon">
            <el-icon><Search /></el-icon>
          </div>
          <h2>TRA CỨU ĐƠN HÀNG</h2>
          <p>Nhập mã đơn hàng hoặc số điện thoại để kiểm tra hành trình vận chuyển chi tiết</p>
        </div>

        <el-form :inline="true" class="search-form" @submit.prevent="handleSearch">
          <el-form-item label="Mã đơn hàng">
            <el-input
              v-model="searchCode"
              placeholder="VD: DH20261118..."
              clearable
              size="large"
              class="input-code"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Số điện thoại (tùy chọn)">
            <el-input
              v-model="searchPhone"
              placeholder="VD: 0912345678"
              clearable
              size="large"
              class="input-phone"
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="form-btn">
            <el-button
              type="primary"
              size="large"
              :loading="searching"
              class="btn-search-submit"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              Tra Cứu
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- State: Loading -->
      <div v-if="searching" class="card status-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- State: Not Found -->
      <div v-else-if="hasSearched && !orderData" class="card not-found-card">
        <el-result
          icon="error"
          title="Không tìm thấy thông tin đơn hàng"
          sub-title="Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ CSKH qua hotline 1900 6868 để được hỗ trợ."
        >
          <template #extra>
            <el-button @click="resetSearch">Thử lại</el-button>
            <el-button type="primary" @click="router.push('/shop')">Khám phá sản phẩm</el-button>
          </template>
        </el-result>
      </div>

      <!-- State: Order Result Found -->
      <div v-else-if="orderData" class="order-result">
        <!-- Top Status Bar -->
        <div class="card order-top-card">
          <div class="order-info-meta">
            <div class="meta-item">
              <span class="label">Mã đơn hàng:</span>
              <span class="value-code">{{ orderData.orderCode }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Thời gian tạo:</span>
              <span class="value">{{ formatDate(orderData.orderDate) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Hình thức thanh toán:</span>
              <span class="value">{{ orderData.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : 'Tiền mặt khi nhận hàng (COD)' }}</span>
            </div>
          </div>
          <div class="order-status-pill">
            <span class="pill-badge" :class="orderData.status ? orderData.status.toLowerCase() : 'confirmed'">
              {{ formatStatus(orderData.status) }}
            </span>
          </div>
        </div>

        <!-- Timeline Steps -->
        <div class="card timeline-card">
          <h3 class="card-title">Hành Trình Đơn Hàng</h3>

          <div v-if="orderData.status === 'CANCELLED'" class="cancelled-banner">
            <el-alert
              title="Đơn hàng này đã bị hủy"
              type="error"
              description="Đơn hàng đã được hủy theo yêu cầu hoặc do sự cố kho hàng. Liên hệ hỗ trợ nếu cần thông tin chi tiết."
              show-icon
              :closable="false"
            />
          </div>

          <el-steps
            v-else
            :active="stepActiveIndex"
            finish-status="success"
            align-center
            class="store-steps"
          >
            <el-step title="Đã đặt hàng" description="Tiếp nhận thông tin" />
            <el-step title="Đã xác nhận" description="Đang kiểm tra hàng" />
            <el-step title="Đang giao hàng" description="Chuyển cho đơn vị vận chuyển" />
            <el-step title="Giao thành công" description="Hoàn tất đơn hàng" />
          </el-steps>
        </div>

        <div class="detail-columns">
          <!-- Left: Customer info & QR if needed -->
          <div class="info-block">
            <div class="card">
              <h3 class="card-title">
                <el-icon><Location /></el-icon>
                Địa Chỉ Giao Hàng
              </h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="lbl">Người nhận:</span>
                  <span class="val">{{ orderData.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="lbl">Số điện thoại:</span>
                  <span class="val">{{ orderData.customerPhone }}</span>
                </div>
                <div class="info-item">
                  <span class="lbl">Địa chỉ:</span>
                  <span class="val">{{ orderData.shippingAddress }}</span>
                </div>
                <div v-if="orderData.note" class="info-item">
                  <span class="lbl">Ghi chú:</span>
                  <span class="val italic">{{ orderData.note }}</span>
                </div>
              </div>
            </div>

            <!-- VietQR reminder if not paid -->
            <div v-if="orderData.paymentMethod === 'BANK_TRANSFER' && orderData.qrPaymentUrl" class="card qr-box">
              <h3 class="card-title">
                <el-icon><CreditCard /></el-icon>
                Mã QR Thanh Toán
              </h3>
              <div class="qr-content">
                <img :src="orderData.qrPaymentUrl" alt="VietQR" class="qr-preview" />
                <div class="qr-info">
                  <p class="bank-name">MB Bank - 0901000001</p>
                  <p class="acc-name">SNEAKERHUB STORE</p>
                  <p class="syntax">Nội dung: <b>{{ orderData.orderCode }}</b></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Item list -->
          <div class="items-block">
            <div class="card">
              <h3 class="card-title">
                <el-icon><Goods /></el-icon>
                Chi Tiết Sản Phẩm ({{ (orderData.items && orderData.items.length) || 0 }})
              </h3>

              <div class="items-table">
                <div
                  v-for="(item, idx) in orderData.items"
                  :key="idx"
                  class="item-line"
                >
                  <img
                    :src="item.productImageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=150&q=80'"
                    :alt="item.productName"
                    class="item-thumb"
                  />
                  <div class="item-info">
                    <h4 class="item-title">{{ item.productName }}</h4>
                    <div class="item-tags">
                      <span v-if="item.sizeValue" class="tag">Size: {{ item.sizeValue }}</span>
                      <span v-if="item.colorName" class="tag">Màu: {{ item.colorName }}</span>
                      <span class="qty">x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-cost">
                    {{ formatCurrency(item.unitPrice * item.quantity) }}
                  </div>
                </div>
              </div>

              <div class="cost-summary">
                <div class="cost-row">
                  <span>Tạm tính</span>
                  <span>{{ formatCurrency(orderData.totalAmount) }}</span>
                </div>
                <div class="cost-row">
                  <span>Phí ship</span>
                  <span class="free">Miễn phí</span>
                </div>
                <div class="cost-row total-row">
                  <span>Tổng tiền</span>
                  <span class="total-val">{{ formatCurrency(orderData.totalAmount) }}</span>
                </div>
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
import { useRoute, useRouter } from 'vue-router'
import {
  Search,
  Document,
  Phone,
  Location,
  CreditCard,
  Goods
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import storeService from '@/services/storeService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const searchCode = ref('')
const searchPhone = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const orderData = ref(null)

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
    CONFIRMED: 'Đã xác nhận đơn hàng',
    PENDING: 'Chờ thanh toán / xác nhận',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy'
  }
  return map[st] || st || 'Đã xác nhận'
}
</script>

<style scoped lang="scss">
.store-track-order {
  background: #f8fafc;
  min-height: calc(100vh - 80px);
  padding: 40px 0 80px;

  .store-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }
}

.track-search-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 36px 30px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  .search-header {
    text-align: center;
    margin-bottom: 28px;

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      font-size: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    h2 {
      font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 6px;
    }

    p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }
  }

  .search-form {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 0;
    }

    .input-code {
      width: 280px;
    }

    .input-phone {
      width: 240px;
    }

    .btn-search-submit {
      background: #0f172a;
      border-color: #0f172a;
      font-weight: 700;
      padding: 0 24px;

      &:hover {
        background: #2563eb;
        border-color: #2563eb;
      }
    }
  }
}

.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  padding: 24px;
  margin-bottom: 20px;

  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #2563eb;
      font-size: 18px;
    }
  }
}

.order-top-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .order-info-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
      }

      .value {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
      }

      .value-code {
        font-size: 18px;
        font-weight: 900;
        color: #2563eb;
        font-family: monospace;
      }
    }
  }

  .pill-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;

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

.timeline-card {
  .store-steps {
    margin: 20px 0 10px;

    :deep(.el-step__title) {
      font-size: 14px;
      font-weight: 700;
    }

    :deep(.el-step__description) {
      font-size: 12px;
    }
  }
}

.detail-columns {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .info-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #f1f5f9;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .lbl {
      color: #64748b;
    }

    .val {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
  }
}

.qr-box {
  .qr-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .qr-preview {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      padding: 4px;
    }

    .qr-info {
      font-size: 13px;

      p {
        margin: 0 0 4px;
      }

      .bank-name {
        font-weight: 700;
        color: #0f172a;
      }

      .acc-name {
        color: #475569;
      }

      .syntax {
        color: #2563eb;
      }
    }
  }
}

.items-table {
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 16px;

  .item-line {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    .item-thumb {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .item-info {
      flex: 1;

      .item-title {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 4px;
        color: #0f172a;
      }

      .item-tags {
        display: flex;
        gap: 6px;
        align-items: center;

        .tag {
          font-size: 10px;
          background: #f1f5f9;
          padding: 1px 5px;
          border-radius: 3px;
          color: #475569;
          font-weight: 600;
        }

        .qty {
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
        }
      }
    }

    .item-cost {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
  }
}

.cost-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;

  .cost-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 6px;

    .free {
      color: #10b981;
      font-weight: 700;
    }

    &.total-row {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;

      .total-val {
        color: #ef4444;
        font-size: 17px;
      }
    }
  }
}
</style>
