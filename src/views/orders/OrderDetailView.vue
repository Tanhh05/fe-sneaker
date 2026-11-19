<template>
  <div class="order-detail-page" v-loading="loading">
    <!-- TOP STICKY ACTION BAR -->
    <div class="top-action-bar">
      <div class="bar-left">
        <button type="button" class="btn-back" @click="goBack">
          <el-icon><Back /></el-icon>
          <span>QUAY LẠI DANH SÁCH</span>
        </button>
        <div class="bar-divider"></div>
        <div class="bar-title-group" v-if="order">
          <div class="bar-badges">
            <span class="code-badge">{{ order.orderCode }}</span>
            <el-tag :type="ORDER_STATUS_MAP[order.status]?.type || 'info'" size="small">
              {{ ORDER_STATUS_MAP[order.status]?.label || order.status }}
            </el-tag>
            <span class="channel-pill" :class="isOnlineOrder ? 'channel-online' : 'channel-pos'">
              {{ isOnlineOrder ? 'ONLINE STORE' : 'BÁN TẠI QUẦY (POS)' }}
            </span>
          </div>
          <h2 class="bar-title">
            CHI TIẾT ĐƠN HÀNG: {{ order.orderCode }}
          </h2>
        </div>
      </div>

      <div class="bar-right" v-if="order">
        <button type="button" class="btn-print" @click="invoiceVisible = true">
          <el-icon><Printer /></el-icon>
          <span>IN HÓA ĐƠN</span>
        </button>

        <!-- Status Actions -->
        <button
          v-if="order.status === 'DRAFT' || order.status === 'PENDING'"
          type="button"
          class="btn-action-status btn-confirm"
          @click="changeStatus('CONFIRMED', 'Xác nhận đơn hàng')"
        >
          <el-icon><Check /></el-icon>
          <span>Xác nhận đơn</span>
        </button>

        <button
          v-if="order.status === 'CONFIRMED'"
          type="button"
          class="btn-action-status btn-ship"
          @click="changeStatus('SHIPPING', 'Bắt đầu giao hàng')"
        >
          <el-icon><Van /></el-icon>
          <span>Bắt đầu giao hàng</span>
        </button>

        <button
          v-if="['CONFIRMED', 'SHIPPING', 'DRAFT', 'PENDING'].includes(order.status)"
          type="button"
          class="btn-action-status btn-complete"
          @click="changeStatus('COMPLETED', 'Hoàn thành đơn hàng')"
        >
          <el-icon><Check /></el-icon>
          <span>Hoàn thành đơn</span>
        </button>

        <button
          v-if="order.status !== 'COMPLETED' && order.status !== 'CANCELLED'"
          type="button"
          class="btn-action-status btn-cancel"
          @click="changeStatus('CANCELLED', 'Hủy đơn hàng')"
        >
          <el-icon><Close /></el-icon>
          <span>Hủy đơn</span>
        </button>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <div v-if="order" class="order-detail-container">
      <!-- 1. VISUAL PROGRESS STEPPER -->
      <div class="stepper-card">
        <div class="stepper-header">
          <span class="stepper-title">TIẾN TRÌNH XỬ LÝ ĐƠN HÀNG</span>
          <span class="stepper-created">Khởi tạo: {{ formatDateTime(order.orderDate) }}</span>
        </div>
        <div class="stepper-body">
          <el-steps
            :active="activeStepIndex"
            finish-status="success"
            align-center
            :process-status="order.status === 'CANCELLED' ? 'error' : 'finish'"
          >
            <el-step title="Tiếp nhận" :description="formatDateTime(order.orderDate)" />
            <el-step title="Đã xác nhận" :description="getStatusTime('CONFIRMED')" />
            <el-step title="Đang giao hàng" :description="getStatusTime('SHIPPING')" />
            <el-step
              :title="order.status === 'CANCELLED' ? 'Đã hủy đơn' : 'Hoàn thành'"
              :description="getStatusTime(order.status)"
            />
          </el-steps>
        </div>
      </div>

      <!-- 2. TWO-COLUMN LAYOUT -->
      <div class="detail-grid">
        <!-- CỘT TRÁI: SẢN PHẨM & LỊCH SỬ (65%) -->
        <div class="col-main">
          <!-- CARD: DANH SÁCH SẢN PHẨM -->
          <div class="info-block-card">
            <div class="block-header">
              <div class="block-badge">01. DANH SÁCH SẢN PHẨM TRONG ĐƠN ({{ (order.details || []).length }} MẶT HÀNG)</div>
            </div>

            <div class="items-table-wrap">
              <el-table :data="order.details || []" border stripe size="default" style="width: 100%">
                <template #empty>
                  <el-empty description="Không có thông tin mặt hàng" :image-size="60" />
                </template>
                <el-table-column type="index" label="#" width="50" align="center" />
                <el-table-column label="Tên sản phẩm Sneaker" min-width="220">
                  <template #default="{ row }">
                    <div class="prod-cell">
                      <span class="prod-name">{{ row.productName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="sku" label="Mã SKU" width="140">
                  <template #default="{ row }">
                    <span class="code-badge">{{ row.sku }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Size / Màu sắc" width="150">
                  <template #default="{ row }">
                    <span class="size-pill">EU {{ row.sizeValue }}</span>
                    <span class="color-text">{{ row.colorName }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="SL" width="70" align="center">
                  <template #default="{ row }">
                    <strong>x{{ row.quantity }}</strong>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130" align="right">
                  <template #default="{ row }">{{ formatCurrency(row.unitPrice) }}</template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="140" align="right">
                  <template #default="{ row }">
                    <strong class="price-val">{{ formatCurrency(row.subtotal) }}</strong>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- Financial Summary Box -->
            <div class="financial-summary-panel">
              <div class="fin-row">
                <span class="fin-label">Tổng tiền hàng cơ sở:</span>
                <span class="fin-val">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Chiết khấu / Giảm giá:</span>
                <span class="fin-val text-muted">0 đ</span>
              </div>
              <div class="fin-row">
                <span class="fin-label">Phí vận chuyển:</span>
                <span class="fin-val text-muted">0 đ (Miễn phí)</span>
              </div>
              <div class="fin-divider"></div>
              <div class="fin-row total-highlight">
                <span class="fin-total-label">TỔNG TIỀN THANH TOÁN:</span>
                <strong class="fin-total-val">{{ formatCurrency(order.finalAmount) }}</strong>
              </div>
            </div>
          </div>

          <!-- CARD: LỊCH SỬ THAY ĐỔI TRẠNG THÁI (AUDIT TIMELINE) -->
          <div class="info-block-card">
            <div class="block-header">
              <div class="block-badge">02. NHẬT KÝ THAY ĐỔI TRẠNG THÁI (AUDIT TIMELINE)</div>
            </div>
            <div class="timeline-wrap">
              <el-timeline>
                <el-timeline-item
                  v-for="h in order.histories || []"
                  :key="h.id"
                  :timestamp="formatDateTime(h.changedAt)"
                  placement="top"
                  :type="getTimelineType(h.toStatus)"
                >
                  <div class="timeline-entry">
                    <div class="entry-header">
                      <span class="entry-status">
                        {{ h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Khởi tạo đơn: ${h.toStatus}` }}
                      </span>
                      <span class="entry-actor">Thực hiện: <strong>{{ h.createdBy || 'SYSTEM' }}</strong></span>
                    </div>
                    <p class="entry-note">{{ h.note || 'Không có ghi chú thao tác' }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>

          <!-- CARD: LỊCH SỬ THANH TOÁN (PAYMENTS) -->
          <div v-if="order.payments && order.payments.length" class="info-block-card">
            <div class="block-header">
              <div class="block-badge">03. CHỨNG TỪ GIAO DỊCH THANH TOÁN ({{ order.payments.length }} GIAO DỊCH)</div>
            </div>
            <el-table :data="order.payments" border stripe size="small">
              <el-table-column prop="paymentCode" label="Mã giao dịch" width="130">
                <template #default="{ row }">
                  <span class="code-badge">{{ row.paymentCode }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Phương thức" width="140">
                <template #default="{ row }">
                  {{ PAYMENT_METHOD_MAP[row.paymentMethod] || row.paymentMethod }}
                </template>
              </el-table-column>
              <el-table-column label="Số tiền" width="130" align="right">
                <template #default="{ row }">
                  <strong class="price-val">{{ formatCurrency(row.amount) }}</strong>
                </template>
              </el-table-column>
              <el-table-column label="Thời gian" width="160">
                <template #default="{ row }">{{ formatDateTime(row.paymentDate) }}</template>
              </el-table-column>
              <el-table-column prop="status" label="Trạng thái" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'PAID' ? 'success' : 'warning'" size="small">
                    {{ row.status === 'PAID' ? 'ĐÃ THU TIỀN' : row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="referenceNote" label="Ghi chú tham chiếu" min-width="160" />
            </el-table>
          </div>
        </div>

        <!-- CỘT PHẢI: THÔNG TIN KHÁCH HÀNG & PHỤ TRÁCH (35%) -->
        <div class="col-side">
          <!-- CARD: THÔNG TIN KHÁCH HÀNG -->
          <div class="side-card">
            <div class="side-card-title">
              <el-icon><User /></el-icon>
              <span>THÔNG TIN KHÁCH HÀNG</span>
            </div>
            <div class="side-card-body">
              <div class="side-row">
                <span class="side-label">Khách hàng:</span>
                <strong class="side-val">{{ order.customerName || 'Khách lẻ tại quầy' }}</strong>
              </div>
              <div class="side-row">
                <span class="side-label">Số điện thoại:</span>
                <span class="side-val mono">{{ order.customerPhone || '---' }}</span>
              </div>
              <div class="side-row">
                <span class="side-label">Mã khách hàng:</span>
                <span class="side-val">{{ order.customerCode || '---' }}</span>
              </div>
              <div class="side-row">
                <span class="side-label">Kênh mua sắm:</span>
                <span class="channel-pill" :class="isOnlineOrder ? 'channel-online' : 'channel-pos'">
                  {{ isOnlineOrder ? 'ONLINE STORE' : 'BÁN TẠI QUẦY (POS)' }}
                </span>
              </div>

              <!-- Chi tiết thông tin giao hàng Online -->
              <div v-if="parsedDelivery" class="delivery-intel-box">
                <div class="delivery-title">
                  <el-icon><Location /></el-icon>
                  <span>ĐỊA CHỈ NHẬN HÀNG (ONLINE STORE)</span>
                </div>
                <div class="del-row">
                  <span class="del-lbl">Người nhận:</span>
                  <strong>{{ parsedDelivery.recipient }}</strong>
                </div>
                <div class="del-row">
                  <span class="del-lbl">SĐT nhận:</span>
                  <span class="mono">{{ parsedDelivery.phone }}</span>
                </div>
                <div class="del-row">
                  <span class="del-lbl">Địa chỉ nhận:</span>
                  <span>{{ parsedDelivery.address }}</span>
                </div>
                <div v-if="parsedDelivery.customerNote" class="del-row">
                  <span class="del-lbl">Lời nhắn:</span>
                  <span class="note-quote">"{{ parsedDelivery.customerNote }}"</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CARD: THANH TOÁN & THU NGÂN -->
          <div class="side-card">
            <div class="side-card-title">
              <el-icon><CreditCard /></el-icon>
              <span>THANH TOÁN &amp; VẬN HÀNH</span>
            </div>
            <div class="side-card-body">
              <div class="side-row">
                <span class="side-label">Phương thức TT:</span>
                <strong class="side-val">{{ PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod }}</strong>
              </div>
              <div class="side-row">
                <span class="side-label">Trạng thái thanh toán:</span>
                <el-tag :type="order.status === 'COMPLETED' ? 'success' : 'warning'" size="small">
                  {{ order.status === 'COMPLETED' ? 'ĐÃ HOÀN TẤT THANH TOÁN' : 'CHỜ XỬ LÝ' }}
                </el-tag>
              </div>
              <div class="side-row">
                <span class="side-label">Nhân viên phụ trách:</span>
                <strong class="side-val">{{ order.employeeName || (isOnlineOrder ? 'Hệ thống Online' : '---') }}</strong>
              </div>
              <div class="side-row">
                <span class="side-label">Thời điểm tạo đơn:</span>
                <span class="side-val">{{ formatDateTime(order.orderDate) }}</span>
              </div>
              <div v-if="order.note && !parsedDelivery" class="side-row full-note">
                <span class="side-label">Ghi chú chung:</span>
                <p class="general-note">{{ order.note }}</p>
              </div>
            </div>
          </div>

          <!-- CARD: QUICK ACTIONS -->
          <div class="side-card print-action-card">
            <button type="button" class="btn-full-print" @click="invoiceVisible = true">
              <el-icon><Printer /></el-icon>
              <span>IN HÓA ĐƠN BÁN LẺ (A4 / POS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Invoice Modal -->
    <InvoicePrintModal v-model="invoiceVisible" :order="order" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Back,
  Printer,
  Check,
  Van,
  Close,
  User,
  CreditCard,
  Location
} from '@element-plus/icons-vue'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/constants'
import InvoicePrintModal from '@/components/InvoicePrintModal.vue'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.params.id)
const loading = ref(false)
const order = ref(null)
const invoiceVisible = ref(false)

const isOnlineOrder = computed(() => {
  if (!order.value) return false
  return (
    !order.value.employeeName ||
    (order.value.note && order.value.note.includes('[ĐƠN HÀNG ONLINE]'))
  )
})

// Parse online delivery information from note if present
const parsedDelivery = computed(() => {
  if (!order.value || !order.value.note) return null
  const note = order.value.note
  if (!note.includes('[ĐƠN HÀNG ONLINE]')) return null

  // Format: [ĐƠN HÀNG ONLINE] Người nhận: X | SĐT: Y | Đ/C nhận: Z | Ghi chú: W
  const getPart = (label) => {
    const match = note.match(new RegExp(`${label}:\\s*([^|]+)`))
    return match ? match[1].trim() : ''
  }

  return {
    recipient: getPart('Người nhận') || order.value.customerName || '---',
    phone: getPart('SĐT') || order.value.customerPhone || '---',
    address: getPart('Đ/C nhận') || '---',
    customerNote: getPart('Ghi chú') || ''
  }
})

const activeStepIndex = computed(() => {
  if (!order.value) return 1
  const s = order.value.status
  if (s === 'COMPLETED') return 4
  if (s === 'SHIPPING') return 3
  if (s === 'CONFIRMED') return 2
  if (s === 'CANCELLED') return 4
  return 1 // DRAFT / PENDING
})

const getStatusTime = (targetStatus) => {
  if (!order.value || !order.value.histories) return ''
  const item = order.value.histories.find((h) => h.toStatus === targetStatus)
  return item ? formatDateTime(item.changedAt) : ''
}

const getTimelineType = (toStatus) => {
  switch (toStatus) {
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'SHIPPING':
      return 'warning'
    case 'CONFIRMED':
      return 'primary'
    default:
      return 'info'
  }
}

async function fetchOrderDetail() {
  if (!orderId.value) return
  loading.value = true
  try {
    const res = await orderService.getOrderById(orderId.value)
    order.value = res.data
  } catch (err) {
    ElMessage.error('Không thể tải thông tin đơn hàng!')
    router.push('/orders')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/orders')
}

function changeStatus(targetStatus, actionTitle) {
  if (!order.value) return
  const defaultNotes = {
    CONFIRMED: 'Nhân viên đã kiểm tra và xác nhận đơn hàng',
    SHIPPING: 'Đơn hàng đã bàn giao cho đơn vị vận chuyển',
    COMPLETED: 'Đơn hàng đã được giao thành công và hoàn tất thanh toán',
    CANCELLED: 'Khách hàng / Nhân viên hủy đơn'
  }

  ElMessageBox.prompt(
    `Nhập ghi chú cho thao tác "${actionTitle}" đối với đơn hàng ${order.value.orderCode}:`,
    actionTitle,
    {
      confirmButtonText: 'Xác nhận thực hiện',
      cancelButtonText: 'Hủy bỏ',
      inputValue: defaultNotes[targetStatus] || `${actionTitle} tại hệ thống`
    }
  )
    .then(async ({ value }) => {
      const res = await orderService.updateOrderStatus(order.value.id, {
        status: targetStatus,
        note: value
      })
      order.value = res.data
      ElMessage.success(
        `Đã cập nhật trạng thái đơn ${order.value.orderCode} sang "${ORDER_STATUS_MAP[targetStatus]?.label || targetStatus}"`
      )
      // Reload full detail with updated histories
      await fetchOrderDetail()
    })
    .catch(() => {})
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail-page {
  padding-bottom: 80px;
}

/* TOP STICKY ACTION BAR */
.top-action-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 2px solid #000000;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;

  .bar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .btn-back {
      background: #ffffff;
      border: 1px solid #000000;
      color: #000000;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 6px 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;
      font-family: var(--font-sans);

      &:hover {
        background: #000000;
        color: #ffffff;
      }
    }

    .bar-divider {
      width: 1px;
      height: 32px;
      background: #e2e8f0;
    }

    .bar-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .bar-badges {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .code-badge {
        background: #000000;
        color: #ffffff;
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 800;
        padding: 2px 7px;
        letter-spacing: 0.05em;
      }

      .bar-title {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: -0.02em;
        margin: 0;
        color: #000000;
      }
    }
  }

  .bar-right {
    display: flex;
    align-items: center;
    gap: 10px;

    .btn-print {
      background: #ffffff;
      border: 1px solid #000000;
      color: #000000;
      font-size: 11px;
      font-weight: 800;
      padding: 7px 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      transition: all 0.12s ease;

      &:hover {
        background: #f1f5f9;
      }
    }

    .btn-action-status {
      font-size: 11px;
      font-weight: 800;
      padding: 7px 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 0;
      border: 1px solid transparent;
      transition: all 0.12s ease;

      &.btn-confirm {
        background: #2563eb;
        color: #ffffff;
        &:hover {
          background: #1d4ed8;
        }
      }

      &.btn-ship {
        background: #d97706;
        color: #ffffff;
        &:hover {
          background: #b45309;
        }
      }

      &.btn-complete {
        background: #10b981;
        color: #ffffff;
        &:hover {
          background: #059669;
        }
      }

      &.btn-cancel {
        background: #ffffff;
        border-color: #ef4444;
        color: #ef4444;
        &:hover {
          background: #ef4444;
          color: #ffffff;
        }
      }
    }
  }
}

.channel-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 2px;

  &.channel-online {
    background: #0284c7;
    color: #ffffff;
  }

  &.channel-pos {
    background: #000000;
    color: #ffffff;
  }
}

/* MAIN BODY CONTAINER */
.order-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* STEPPER CARD */
.stepper-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 16px 20px;
  margin-bottom: 20px;

  .stepper-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e2e8f0;

    .stepper-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #0f172a;
      text-transform: uppercase;
    }

    .stepper-created {
      font-size: 11px;
      color: #64748b;
    }
  }
}

/* DETAIL GRID */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

/* INFO BLOCK CARDS (LEFT) */
.info-block-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  margin-bottom: 20px;
  overflow: hidden;

  .block-header {
    padding: 12px 18px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    .block-badge {
      font-size: 11px;
      font-weight: 800;
      color: #000000;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }

  .items-table-wrap {
    padding: 0;

    .prod-cell {
      .prod-name {
        font-weight: 700;
        color: #0f172a;
      }
    }

    .code-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
    }

    .size-pill {
      background: #000000;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 5px;
      margin-right: 6px;
    }

    .color-text {
      color: #475569;
      font-size: 12px;
    }

    .price-val {
      font-family: var(--font-mono);
      font-weight: 800;
      color: #000000;
    }
  }

  .financial-summary-panel {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .fin-row {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;

      .fin-label {
        color: #64748b;
      }

      .fin-val {
        font-family: var(--font-mono);
        font-weight: 700;
        color: #0f172a;
        min-width: 140px;
        text-align: right;
      }

      .text-muted {
        color: #94a3b8;
      }

      &.total-highlight {
        margin-top: 4px;
        .fin-total-label {
          font-size: 14px;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.03em;
        }

        .fin-total-val {
          font-size: 20px;
          font-weight: 900;
          color: #000000;
          font-family: var(--font-mono);
          min-width: 160px;
          text-align: right;
        }
      }
    }

    .fin-divider {
      width: 280px;
      height: 1px;
      background: #cbd5e1;
      margin: 4px 0;
    }
  }

  .timeline-wrap {
    padding: 20px 24px;

    .timeline-entry {
      .entry-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;

        .entry-status {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
        }

        .entry-actor {
          font-size: 11px;
          color: #64748b;
        }
      }

      .entry-note {
        font-size: 12px;
        color: #475569;
        margin: 0;
      }
    }
  }
}

/* SIDE CARDS (RIGHT) */
.side-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  margin-bottom: 16px;

  .side-card-title {
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #000000;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
  }

  .side-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .side-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;

      .side-label {
        color: #64748b;
        flex-shrink: 0;
      }

      .side-val {
        color: #0f172a;
        text-align: right;

        &.mono {
          font-family: var(--font-mono);
        }
      }

      &.full-note {
        flex-direction: column;
        align-items: stretch;

        .general-note {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          padding: 8px 10px;
          margin: 4px 0 0;
          font-size: 12px;
          color: #334155;
          line-height: 1.4;
        }
      }
    }

    .delivery-intel-box {
      margin-top: 8px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 12px;

      .delivery-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: #166534;
        margin-bottom: 8px;
      }

      .del-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        margin-bottom: 4px;

        .del-lbl {
          color: #15803d;
          font-weight: 700;
          flex-shrink: 0;
        }

        .mono {
          font-family: var(--font-mono);
        }

        .note-quote {
          font-style: italic;
          color: #166534;
        }
      }
    }
  }

  &.print-action-card {
    border: none;
    background: transparent;

    .btn-full-print {
      width: 100%;
      background: #000000;
      color: #ffffff;
      border: none;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #334155;
      }
    }
  }
}
</style>
