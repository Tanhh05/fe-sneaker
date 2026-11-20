<template>
  <div class="store-my-orders-page">
    <div class="layout-container">
      <!-- TOP BREADCRUMB -->
      <div class="my-orders-header">
        <div class="header-breadcrumbs">
          <router-link to="/">Trang chủ</router-link>
          <span class="sep">/</span>
          <span class="current">Đơn hàng của tôi</span>
        </div>
      </div>

      <!-- GUEST PHONE LOOKUP BAR (WHEN NOT LOGGED IN) -->
      <div v-if="!authStore.isAuthenticated" class="guest-lookup-card">
        <div class="lookup-form">
          <div class="lookup-input-wrap">
            <span class="lookup-icon"><Phone /></span>
            <input
              type="text"
              v-model="guestPhone"
              placeholder="Nhập số điện thoại đặt hàng của bạn (VD: 0912345001)..."
              class="lookup-input"
              @keyup.enter="fetchMyOrders"
            />
          </div>
          <button type="button" class="btn-lookup-submit" :disabled="loading || !guestPhone.trim()" @click="fetchMyOrders">
            <el-icon v-if="loading" class="is-loading"><Refresh /></el-icon>
            <span v-else>TRA CỨU ĐƠN HÀNG →</span>
          </button>
        </div>
      </div>

      <!-- STATUS TABS (ALL, PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED) -->
      <div class="orders-nav-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="order-tab-btn"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-badge" :class="tab.value.toLowerCase()">
            {{ getCountByStatus(tab.value) }}
          </span>
        </button>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="orders-filter-bar">
        <div class="filter-search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm theo mã đơn (HD0019...) hoặc tên đôi giày Sneaker..."
            class="filter-search-input"
          />
        </div>

        <div class="filter-right-controls">
          <el-select v-model="paymentFilter" placeholder="Phương thức thanh toán" clearable style="width: 200px">
            <el-option label="Tất cả phương thức" value="" />
            <el-option label="Thanh toán COD (Tiền mặt)" value="CASH" />
            <el-option label="Chuyển khoản VietQR" value="BANK_TRANSFER" />
          </el-select>

          <button type="button" class="btn-control-refresh" @click="fetchMyOrders" :disabled="loading" title="Làm mới">
            <el-icon :class="{ 'is-loading': loading }"><Refresh /></el-icon>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <!-- ORDERS LIST CONTENT -->
      <div class="orders-content-area">
        <!-- LOADING SKELETON -->
        <div v-if="loading" class="orders-loading-state">
          <div class="skeleton-card" v-for="i in 3" :key="i">
            <el-skeleton :rows="5" animated />
          </div>
        </div>

        <!-- EMPTY STATE: NO ORDERS MATCHED -->
        <div v-else-if="filteredOrders.length === 0" class="orders-empty-state">
          <div class="empty-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-svg">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
          </div>
          <h3 class="empty-title">
            {{ allOrders.length === 0 ? 'Bạn chưa có đơn hàng nào tại SneakerHub' : 'Không có đơn hàng nào khớp với bộ lọc' }}
          </h3>
          <p class="empty-desc">
            {{ allOrders.length === 0
              ? 'Tất cả các đơn hàng mua sắm trực tuyến hoặc tại quầy của bạn sẽ được lưu trữ và cập nhật trạng thái chi tiết tại đây.'
              : 'Hãy thử đổi trạng thái lọc hoặc xóa từ khóa tìm kiếm để xem các đơn hàng khác của bạn nhé.' }}
          </p>
          <div class="empty-actions">
            <button v-if="allOrders.length === 0" type="button" class="btn-empty-shop" @click="$router.push('/shop')">
              KHÁM PHÁ BỘ SƯU TẬP GIÀY &rarr;
            </button>
            <button v-else type="button" class="btn-empty-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <!-- ORDERS CARDS LIST -->
        <div v-else class="orders-cards-list">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            :class="'status-' + (order.status ? order.status.toLowerCase() : 'pending')"
          >
            <!-- CARD HEADER -->
            <div class="card-header">
              <div class="card-header-left">
                <div class="order-code-badge" @click="copyOrderCode(order.orderCode)" title="Bấm để sao chép mã đơn">
                  <span class="code-text">#{{ order.orderCode }}</span>
                  <el-icon class="copy-icon"><DocumentCopy /></el-icon>
                </div>
                <span class="order-date-text">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDateTime(order.orderDate) }}
                </span>
                <span v-if="order.employeeId" class="order-type-tag store">Tại quầy</span>
                <span v-else class="order-type-tag online">Online Store</span>
              </div>

              <div class="card-header-right">
                <div class="payment-pill" :class="order.paymentMethod === 'BANK_TRANSFER' ? 'bank' : 'cash'">
                  <el-icon v-if="order.paymentMethod === 'BANK_TRANSFER'"><CreditCard /></el-icon>
                  <el-icon v-else><Money /></el-icon>
                  <span>{{ order.paymentMethod === 'BANK_TRANSFER' ? 'VietQR MBBank' : 'Thanh toán COD' }}</span>
                </div>

                <div class="status-badge" :class="order.status ? order.status.toLowerCase() : 'pending'">
                  <span class="status-dot"></span>
                  <span class="status-name">{{ getStatusLabel(order.status) }}</span>
                </div>
              </div>
            </div>

            <!-- CARD ITEMS PREVIEW -->
            <div class="card-items-list">
              <div v-for="item in (order.details || [])" :key="item.id" class="order-item-row">
                <div class="item-thumb-box">
                  <img
                    v-if="item.thumbnailUrl"
                    :src="item.thumbnailUrl"
                    :alt="item.productName"
                    class="item-thumb"
                  />
                  <div v-else class="item-thumb placeholder">
                    SNK
                  </div>
                </div>

                <div class="item-details">
                  <h4 class="item-name" :title="item.productName">{{ item.productName }}</h4>
                  <div class="item-specs">
                    <span class="sku-tag">{{ item.sku }}</span>
                    <span class="spec-pill">EU {{ item.sizeValue }}</span>
                    <span class="spec-color">{{ item.colorName }}</span>
                  </div>
                </div>

                <div class="item-calc">
                  <span class="item-calc-formula">
                    {{ formatCurrency(item.unitPrice) }} &times; {{ item.quantity }}
                  </span>
                  <strong class="item-subtotal">
                    {{ formatCurrency(item.subtotal) }}
                  </strong>
                  <button
                    v-if="order.status === 'COMPLETED'"
                    type="button"
                    class="btn-item-review"
                    @click="openReviewModal(order, item)"
                  >
                    <el-icon><Star /></el-icon>
                    <span>Đánh giá &amp; Ảnh on-feet</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- CARD RECIPIENT INFO & NOTE -->
            <div class="card-meta-bar">
              <div class="meta-col recipient">
                <span class="meta-label">Người nhận &amp; Giao hàng:</span>
                <span class="meta-value">
                  <strong>{{ order.customerName || 'Khách hàng' }}</strong>
                  <span v-if="order.customerPhone"> - {{ order.customerPhone }}</span>
                  <span v-if="order.customerAddress" class="meta-address"> | {{ order.customerAddress }}</span>
                </span>
              </div>

              <div v-if="order.note" class="meta-col note">
                <span class="meta-label">Ghi chú:</span>
                <span class="meta-value note-text">{{ order.note }}</span>
              </div>
            </div>

            <!-- CARD FOOTER & ACTIONS -->
            <div class="card-footer">
              <div class="card-footer-left">
                <div class="footer-total-block">
                  <span class="total-label">Tổng thanh toán:</span>
                  <span class="total-amount">{{ formatCurrency(order.finalAmount || order.totalAmount) }}</span>
                </div>
              </div>

              <div class="card-footer-actions">
                <!-- VIEW DETAIL / TRACKING TIMELINE BUTTON -->
                <button type="button" class="btn-card-action secondary" @click="openOrderDetailDrawer(order)">
                  <el-icon><Tickets /></el-icon>
                  <span>Chi tiết &amp; Lịch sử</span>
                </button>

                <!-- REVIEW BUTTON (WHEN COMPLETED) -->
                <button
                  v-if="order.status === 'COMPLETED'"
                  type="button"
                  class="btn-card-action review-highlight"
                  @click="openReviewForFirstItem(order)"
                >
                  <el-icon><Star /></el-icon>
                  <span>Đánh giá sản phẩm</span>
                </button>

                <!-- PAY NOW VIA VIETQR (IF BANK_TRANSFER & NOT COMPLETED/CANCELLED) -->
                <button
                  v-if="order.paymentMethod === 'BANK_TRANSFER' && order.status === 'PENDING'"
                  type="button"
                  class="btn-card-action qr-pay"
                  @click="openQrPayModal(order)"
                >
                  <el-icon><CreditCard /></el-icon>
                  <span>Quét mã VietQR</span>
                </button>

                <!-- CANCEL ORDER BUTTON (ONLY WHEN PENDING) -->
                <button
                  v-if="order.status === 'PENDING'"
                  type="button"
                  class="btn-card-action danger"
                  @click="openCancelModal(order)"
                >
                  <el-icon><Close /></el-icon>
                  <span>Hủy đơn</span>
                </button>

                <!-- RE-ORDER BUTTON -->
                <button type="button" class="btn-card-action primary" @click="handleReorder(order)">
                  <el-icon><Refresh /></el-icon>
                  <span>Mua lại đơn này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL & SHIPMENT TIMELINE DRAWER -->
    <el-drawer
      v-model="drawerVisible"
      :title="`HÀNH TRÌNH VẬN ĐƠN: #${selectedOrder?.orderCode || ''}`"
      size="560px"
      direction="rtl"
      class="order-detail-drawer"
    >
      <div v-if="selectedOrder" class="drawer-inner">
        <!-- TOP SUMMARY HEADER -->
        <div class="drawer-hero-card">
          <div class="hero-top-row">
            <div>
              <span class="drawer-kicker">MÃ ĐƠN HÀNG</span>
              <h2 class="drawer-code">{{ selectedOrder.orderCode }}</h2>
            </div>
            <div class="status-badge" :class="selectedOrder.status ? selectedOrder.status.toLowerCase() : 'pending'">
              <span class="status-dot"></span>
              <span>{{ getStatusLabel(selectedOrder.status) }}</span>
            </div>
          </div>

          <div class="hero-meta-grid">
            <div class="hero-meta-item">
              <span class="label">Ngày đặt:</span>
              <span class="val">{{ formatDateTime(selectedOrder.orderDate) }}</span>
            </div>
            <div class="hero-meta-item">
              <span class="label">Phương thức:</span>
              <span class="val">{{ selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'VietQR MBBank' : 'Thanh toán COD' }}</span>
            </div>
            <div class="hero-meta-item">
              <span class="label">Người nhận:</span>
              <span class="val">{{ selectedOrder.customerName }} ({{ selectedOrder.customerPhone || '---' }})</span>
            </div>
            <div class="hero-meta-item">
              <span class="label">Địa chỉ nhận:</span>
              <span class="val">{{ selectedOrder.customerAddress || 'Nhận trực tiếp tại cửa hàng' }}</span>
            </div>
          </div>
        </div>

        <!-- TRACKING TIMELINE -->
        <div class="drawer-timeline-section">
          <h3 class="section-title">
            <el-icon><Van /></el-icon>
            <span>HÀNH TRÌNH TIẾN ĐỘ ĐƠN HÀNG</span>
          </h3>

          <div v-if="selectedOrder.histories && selectedOrder.histories.length > 0" class="timeline-stepper">
            <div
              v-for="(hist, idx) in selectedOrder.histories"
              :key="hist.id || idx"
              class="timeline-item"
              :class="{ 'is-last': idx === selectedOrder.histories.length - 1 }"
            >
              <div class="timeline-marker">
                <span class="marker-dot"></span>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <strong class="timeline-status">{{ getStatusLabel(hist.toStatus) }}</strong>
                  <span class="timeline-time">{{ formatDateTime(hist.changedAt) }}</span>
                </div>
                <p class="timeline-note">{{ hist.note || 'Cập nhật tiến trình đơn hàng' }}</p>
                <span v-if="hist.createdBy" class="timeline-actor">Bởi: {{ hist.createdBy }}</span>
              </div>
            </div>
          </div>
          <div v-else class="timeline-fallback">
            <p>Đơn hàng đã được ghi nhận trên hệ thống và đang chờ xác nhận.</p>
          </div>
        </div>

        <!-- ITEMS BREAKDOWN -->
        <div class="drawer-items-section">
          <h3 class="section-title">
            <el-icon><Box /></el-icon>
            <span>DANH SÁCH SẢN PHẨM ({{ selectedOrder.details?.length || 0 }})</span>
          </h3>

          <div class="drawer-items-list">
            <div v-for="item in (selectedOrder.details || [])" :key="item.id" class="drawer-item-row">
              <img
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.productName"
                class="drawer-item-thumb"
              />
              <div v-else class="drawer-item-thumb placeholder">SNK</div>

              <div class="drawer-item-meta">
                <h4 class="drawer-item-title">{{ item.productName }}</h4>
                <div class="drawer-item-tags">
                  <span class="sku-tag">{{ item.sku }}</span>
                  <span class="spec-pill">EU {{ item.sizeValue }}</span>
                  <span class="spec-color">{{ item.colorName }}</span>
                </div>
                <div class="drawer-item-sub">
                  {{ formatCurrency(item.unitPrice) }} &times; {{ item.quantity }} = <strong>{{ formatCurrency(item.subtotal) }}</strong>
                </div>
                <button
                  v-if="selectedOrder.status === 'COMPLETED'"
                  type="button"
                  class="btn-drawer-review"
                  @click="openReviewModal(selectedOrder, item)"
                >
                  <el-icon><Star /></el-icon>
                  <span>Viết đánh giá &amp; Gửi ảnh on-feet</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TOTAL BREAKDOWN -->
        <div class="drawer-summary-section">
          <div class="summary-line">
            <span>Tổng tiền hàng:</span>
            <span>{{ formatCurrency(selectedOrder.totalAmount) }}</span>
          </div>
          <div class="summary-line">
            <span>Phí vận chuyển:</span>
            <span class="text-success">Miễn phí (Free Ship)</span>
          </div>
          <div class="summary-line final">
            <span>TỔNG CỘNG THANH TOÁN:</span>
            <span class="final-price">{{ formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount) }}</span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- VIETQR PAYMENT MODAL -->
    <el-dialog
      v-model="qrModalVisible"
      title="QUÉT MÃ VIETQR THANH TOÁN ĐƠN HÀNG"
      width="440px"
      class="vietqr-dialog"
      :show-close="true"
    >
      <div v-if="qrOrder" class="qr-dialog-content">
        <!-- ĐÃ GẠCH NỢ THÀNH CÔNG -->
        <div v-if="qrOrder.status === 'CONFIRMED' || isQrOrderPaid" class="qr-paid-success-box">
          <div class="paid-check-circle">✓</div>
          <h4 class="paid-title">ĐÃ GẠCH NỢ TỰ ĐỘNG THÀNH CÔNG!</h4>
          <p class="paid-sub">
            Giao dịch chuyển khoản cho đơn hàng <strong>#{{ qrOrder.orderCode }}</strong> đã được cổng SePay khớp lệnh thành công. Đơn hàng đã chuyển sang trạng thái <strong>ĐÃ XÁC NHẬN</strong>.
          </p>
          <div class="paid-amount-row">
            <span>Số tiền đã thanh toán:</span>
            <strong>{{ formatCurrency(qrOrder.finalAmount || qrOrder.totalAmount) }}</strong>
          </div>
          <button type="button" class="btn-close-qr success" @click="qrModalVisible = false">
            HOÀN TẤT &amp; ĐÓNG CỬA SỔ
          </button>
        </div>

        <!-- CHỜ THANH TOÁN -->
        <template v-else>
          <div class="qr-notice-box">
            <span class="qr-notice-kicker">MBBANK CHÍNH HÃNG</span>
            <p class="qr-notice-text">
              Mở App ngân hàng bất kỳ, chọn <strong>Quét mã QR</strong> để chuyển khoản tự động khớp chính xác số tiền &amp; nội dung.
            </p>
          </div>

          <div class="qr-image-wrapper">
            <img
              v-if="qrOrder.qrPaymentUrl"
              :src="qrOrder.qrPaymentUrl"
              alt="Mã VietQR MBBank"
              class="vietqr-img"
            />
            <div v-else class="qr-fallback-box">
              Đang tải mã QR chuyển khoản...
            </div>
          </div>

          <div class="qr-modal-radar">
            <span class="radar-ping"></span>
            <span class="radar-text">Đang lắng nghe chuyển khoản từ SePay theo thời gian thực...</span>
          </div>

          <div class="bank-details-card">
            <div class="bank-row">
              <span class="bank-lbl">Ngân hàng:</span>
              <strong class="bank-val">{{ qrOrder.bankName || 'MBBank (Ngân hàng Quân Đội)' }}</strong>
            </div>
            <div class="bank-row">
              <span class="bank-lbl">Số tài khoản:</span>
              <strong class="bank-val mono" @click="copyText(qrOrder.bankAccount || '0346771322', 'Đã chép số tài khoản MBBank!')">
                {{ qrOrder.bankAccount || '0346771322' }}
                <el-icon class="copy-ic"><DocumentCopy /></el-icon>
              </strong>
            </div>
            <div class="bank-row">
              <span class="bank-lbl">Chủ tài khoản:</span>
              <strong class="bank-val">{{ qrOrder.accountName || 'SNEAKERHUB PRO' }}</strong>
            </div>
            <div class="bank-row">
              <span class="bank-lbl">Số tiền:</span>
              <strong class="bank-val price">{{ formatCurrency(qrOrder.finalAmount || qrOrder.totalAmount) }}</strong>
            </div>
            <div class="bank-row">
              <span class="bank-lbl">Nội dung CK:</span>
              <strong class="bank-val memo mono" @click="copyText(qrOrder.orderCode, 'Đã chép nội dung chuyển khoản!')">
                {{ qrOrder.orderCode }}
                <el-icon class="copy-ic"><DocumentCopy /></el-icon>
              </strong>
            </div>
          </div>

          <button type="button" class="btn-close-qr" @click="qrModalVisible = false">
            ĐÃ HOÀN TẤT CHUYỂN KHOẢN
          </button>
        </template>
      </div>
    </el-dialog>

    <!-- CANCEL ORDER CONFIRMATION MODAL -->
    <el-dialog
      v-model="cancelModalVisible"
      title="XÁC NHẬN HỦY ĐƠN HÀNG"
      width="460px"
      class="cancel-order-dialog"
    >
      <div v-if="orderToCancel" class="cancel-dialog-content">
        <div class="cancel-warning-banner">
          <el-icon class="warn-icon"><Warning /></el-icon>
          <div class="warn-text">
            <strong>Bạn có chắc chắn muốn hủy đơn hàng #{{ orderToCancel.orderCode }}?</strong>
            <p>Sau khi xác nhận hủy, số lượng giày sẽ được hoàn trả lại kho và đơn hàng không thể khôi phục.</p>
          </div>
        </div>

        <div class="cancel-reason-form">
          <label class="reason-label">Vui lòng chọn lý do hủy (*):</label>
          <el-radio-group v-model="cancelReason" class="reason-radio-group">
            <el-radio label="Đổi ý, không có nhu cầu mua nữa" />
            <el-radio label="Muốn đổi size / đổi màu sắc khác" />
            <el-radio label="Muốn thay đổi địa chỉ nhận hàng" />
            <el-radio label="Tìm thấy mức giá hoặc mẫu giày ưng ý hơn" />
            <el-radio label="Lý do khác" />
          </el-radio-group>

          <el-input
            v-if="cancelReason === 'Lý do khác'"
            v-model="cancelCustomNote"
            type="textarea"
            :rows="3"
            placeholder="Nhập chi tiết lý do bạn muốn hủy đơn..."
            class="custom-note-input"
          />
        </div>

        <div class="cancel-actions">
          <button type="button" class="btn-cancel-back" @click="cancelModalVisible = false">
            Giữ lại đơn hàng
          </button>
          <button
            type="button"
            class="btn-cancel-confirm"
            :disabled="cancelling"
            @click="confirmCancelOrder"
          >
            <el-icon v-if="cancelling" class="is-loading"><Refresh /></el-icon>
            <span v-else>XÁC NHẬN HỦY ĐƠN</span>
          </button>
        </div>
      </div>
    </el-dialog>

    <!-- CUSTOMER REVIEW MODAL -->
    <CustomerReviewModal
      v-model="reviewModalVisible"
      :product="reviewProduct"
      :order-code="reviewOrderCode"
      :customer-phone="reviewCustomerPhone"
      @submitted="handleReviewSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Tickets,
  Search,
  Refresh,
  Calendar,
  Money,
  CreditCard,
  Phone,
  Close,
  Warning,
  DocumentCopy,
  Van,
  Box,
  Star
} from '@element-plus/icons-vue'
import CustomerReviewModal from '@/components/store/CustomerReviewModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import storeService from '@/services/storeService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

// STATE
const loading = ref(false)
const allOrders = ref([])
const currentTab = ref('ALL')
const searchQuery = ref('')
const paymentFilter = ref('')
const guestPhone = ref('')

// REVIEW STATE
const reviewModalVisible = ref(false)
const reviewProduct = ref(null)
const reviewOrderCode = ref('')
const reviewCustomerPhone = ref('')

const openReviewModal = (order, item) => {
  reviewOrderCode.value = order.orderCode
  reviewCustomerPhone.value = order.customerPhone || (authStore.user ? authStore.user.phone : '')
  reviewProduct.value = {
    id: item.productId,
    productName: item.productName,
    thumbnailUrl: item.thumbnailUrl
  }
  reviewModalVisible.value = true
}

const openReviewForFirstItem = (order) => {
  if (order.details && order.details.length > 0) {
    openReviewModal(order, order.details[0])
  } else {
    ElMessage.info('Không tìm thấy sản phẩm trong đơn hàng để đánh giá')
  }
}

const handleReviewSubmitted = () => {
  ElMessage.success('🎉 Cảm ơn bạn! Đánh giá và ảnh On-feet đã được đăng thành công.')
  fetchMyOrders()
}

// DRAWER & MODAL STATES
const drawerVisible = ref(false)
const selectedOrder = ref(null)

const qrModalVisible = ref(false)
const qrOrder = ref(null)

const cancelModalVisible = ref(false)
const orderToCancel = ref(null)
const cancelReason = ref('Đổi ý, không có nhu cầu mua nữa')
const cancelCustomNote = ref('')
const cancelling = ref(false)

const statusTabs = [
  { label: 'TẤT CẢ', value: 'ALL' },
  { label: 'CHỜ XÁC NHẬN', value: 'PENDING' },
  { label: 'ĐÃ XÁC NHẬN', value: 'CONFIRMED' },
  { label: 'ĐANG GIAO', value: 'SHIPPING' },
  { label: 'HOÀN THÀNH', value: 'COMPLETED' },
  { label: 'ĐÃ HỦY', value: 'CANCELLED' }
]

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

// COUNT PER STATUS
const getCountByStatus = (status) => {
  if (status === 'ALL') return allOrders.value.length
  return allOrders.value.filter(o => o.status === status).length
}

// STATUS LABELS
const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận'
    case 'CONFIRMED':
      return 'Đã xác nhận'
    case 'SHIPPING':
      return 'Đang giao hàng'
    case 'COMPLETED':
      return 'Hoàn thành'
    case 'CANCELLED':
      return 'Đã hủy'
    default:
      return status || 'Đang xử lý'
  }
}

// FETCH ORDERS
const fetchMyOrders = async () => {
  loading.value = true
  try {
    const params = {}
    if (authStore.isAuthenticated && authStore.user) {
      if (authStore.user.phone) params.phone = authStore.user.phone
      if (authStore.user.email) params.email = authStore.user.email
    } else if (guestPhone.value.trim()) {
      params.phone = guestPhone.value.trim()
    } else {
      // Not authenticated and no phone entered
      allOrders.value = []
      loading.value = false
      return
    }

    const res = await storeService.getMyOrders(params)
    allOrders.value = res?.data || []
  } catch (err) {
    console.error('Lỗi tải danh sách đơn hàng:', err)
    ElMessage.error('Không thể tải danh sách đơn hàng lúc này. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

// FILTERED ORDERS
const filteredOrders = computed(() => {
  return allOrders.value.filter(order => {
    // 1. Tab status filter
    if (currentTab.value !== 'ALL' && order.status !== currentTab.value) {
      return false
    }

    // 2. Payment method filter
    if (paymentFilter.value && order.paymentMethod !== paymentFilter.value) {
      return false
    }

    // 3. Search keyword
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchCode = order.orderCode?.toLowerCase().includes(q)
      const matchProduct = (order.details || []).some(d => d.productName?.toLowerCase().includes(q))
      if (!matchCode && !matchProduct) return false
    }

    return true
  })
})

const resetFilters = () => {
  currentTab.value = 'ALL'
  searchQuery.value = ''
  paymentFilter.value = ''
}

const copyOrderCode = (code) => {
  if (!code) return
  navigator.clipboard.writeText(code)
  ElMessage.success(`Đã sao chép mã đơn hàng #${code}!`)
}

const copyText = (text, msg) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  ElMessage.success(msg || 'Đã sao chép vào bộ nhớ tạm!')
}

// OPEN DETAILS DRAWER
const openOrderDetailDrawer = (order) => {
  selectedOrder.value = order
  drawerVisible.value = true
}

// QR REALTIME POLLING VIA SEPAY
const isQrOrderPaid = ref(false)
let qrPollTimer = null

const startQrPolling = (orderCode) => {
  stopQrPolling()
  isQrOrderPaid.value = false
  if (!orderCode) return
  qrPollTimer = setInterval(async () => {
    try {
      const res = await storeService.trackOrder(orderCode)
      if (res?.data && (res.data.status === 'CONFIRMED' || res.data.status === 'COMPLETED')) {
        isQrOrderPaid.value = true
        if (qrOrder.value) {
          qrOrder.value.status = res.data.status
        }
        stopQrPolling()
        ElMessage.success('🎉 SePay đã tự động xác nhận chuyển khoản thành công!')
        fetchOrders()
      }
    } catch (e) {
      console.warn('Lỗi polling QR order:', e)
    }
  }, 2500)
}

const stopQrPolling = () => {
  if (qrPollTimer) {
    clearInterval(qrPollTimer)
    qrPollTimer = null
  }
}

watch(qrModalVisible, (visible) => {
  if (visible && qrOrder.value && qrOrder.value.status === 'PENDING') {
    startQrPolling(qrOrder.value.orderCode)
  } else {
    stopQrPolling()
  }
})

onUnmounted(() => {
  stopQrPolling()
})

// OPEN QR PAY MODAL
const openQrPayModal = (order) => {
  qrOrder.value = order
  isQrOrderPaid.value = order.status === 'CONFIRMED' || order.status === 'COMPLETED'
  qrModalVisible.value = true
}

// OPEN CANCEL MODAL
const openCancelModal = (order) => {
  orderToCancel.value = order
  cancelReason.value = 'Đổi ý, không có nhu cầu mua nữa'
  cancelCustomNote.value = ''
  cancelModalVisible.value = true
}

// CONFIRM CANCEL ORDER
const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return
  cancelling.value = true
  try {
    const finalReason = cancelReason.value === 'Lý do khác'
      ? (cancelCustomNote.value.trim() || 'Khách hàng yêu cầu hủy đơn')
      : cancelReason.value

    const payload = {
      reason: finalReason,
      phone: orderToCancel.value.customerPhone || guestPhone.value.trim()
    }

    const res = await storeService.cancelMyOrder(orderToCancel.value.orderCode, payload)
    ElMessage.success('Đã hủy đơn hàng thành công! Số lượng giày đã được hoàn trả lại kho.')

    // Update in local state
    const updated = res?.data
    if (updated) {
      const idx = allOrders.value.findIndex(o => o.orderCode === updated.orderCode)
      if (idx !== -1) {
        allOrders.value[idx] = updated
      }
    } else {
      await fetchMyOrders()
    }
    cancelModalVisible.value = false
  } catch (err) {
    console.error('Lỗi khi hủy đơn:', err)
    const msg = (err.response && err.response.data && err.response.data.message) || 'Không thể hủy đơn hàng'
    ElMessage.error(msg)
  } finally {
    cancelling.value = false
  }
}

// RE-ORDER (ADD ITEMS TO CART)
const handleReorder = (order) => {
  if (!order.details || order.details.length === 0) {
    ElMessage.warning('Đơn hàng không có sản phẩm nào để đặt lại')
    return
  }

  let count = 0
  for (const item of order.details) {
    cartStore.addItem({
      variantId: item.productVariantId,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      sizeValue: item.sizeValue,
      colorName: item.colorName,
      salePrice: item.unitPrice,
      thumbnailUrl: item.thumbnailUrl
    }, item.quantity)
    count += item.quantity
  }

  ElMessage.success({
    message: `Đã thêm ${count} sản phẩm vào giỏ hàng! Đang chuyển đến giỏ hàng...`,
    duration: 2500
  })

  setTimeout(() => {
    router.push('/cart')
  }, 1000)
}

const triggerOpenLogin = () => {
  window.dispatchEvent(new CustomEvent('open-store-auth-modal', { detail: { tab: 'login' } }))
}

// WATCHERS & LIFECYCLE
watch(() => authStore.isAuthenticated, () => {
  fetchMyOrders()
})

onMounted(() => {
  // If customer came from checkout, check if last_placed_order has phone
  try {
    const last = sessionStorage.getItem('last_placed_order')
    if (last) {
      const parsed = JSON.parse(last)
      if (parsed?.customerPhone && !guestPhone.value) {
        guestPhone.value = parsed.customerPhone
      }
    }
  } catch (e) {
    // ignore
  }

  fetchMyOrders()
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.store-my-orders-page {
  padding: 32px 0 80px;
  background-color: #fafbfc;
  min-height: calc(100vh - 120px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
}

.layout-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* HEADER */
.my-orders-header {
  margin-bottom: 20px;

  .header-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 0;

    a {
      color: #64748b;
      text-decoration: none;
      &:hover {
        color: #000;
      }
    }

    .sep {
      color: #cbd5e1;
    }

    .current {
      color: #0f172a;
    }
  }

  .header-banner {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    background: #000;
    color: #fff;
    padding: 32px 36px;
    border: 1px solid #18181b;
    border-radius: 6px;
    box-shadow: none;
    gap: 24px;

    @media (max-width: 900px) {
      flex-direction: column;
      align-items: flex-start;
      padding: 24px;
    }

    .banner-left {
      .banner-kicker {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #10b981;
        margin-bottom: 8px;
      }

      .banner-title {
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.5px;
        margin: 0 0 8px 0;
        text-transform: uppercase;
      }

      .banner-sub {
        font-size: 14px;
        color: #94a3b8;
        max-width: 580px;
        line-height: 1.5;
        margin: 0;
      }
    }

    .banner-right {
      flex-shrink: 0;

      .auth-user-chip {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #18181b;
        border: 1px solid #3f3f46;
        padding: 8px 16px;

        .user-chip-avatar {
          width: 38px;
          height: 38px;
          background: #fff;
          color: #000;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border-radius: 50%;
        }

        .user-chip-info {
          display: flex;
          flex-direction: column;

          .user-chip-name {
            font-size: 14px;
            font-weight: 800;
            color: #fff;
          }

          .user-chip-meta {
            font-size: 11px;
            color: #10b981;
            font-family: monospace;
          }
        }

        .btn-refresh-orders {
          background: transparent;
          border: 1px solid #3f3f46;
          color: #fff;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #fff;
            color: #000;
          }
        }
      }

      .guest-auth-prompt {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: right;

        @media (max-width: 900px) {
          text-align: left;
        }

        .guest-text {
          font-size: 12px;
          color: #94a3b8;

          strong {
            color: #fff;
            display: block;
            margin-bottom: 2px;
          }
        }

        .btn-guest-login {
          align-self: flex-end;
          background: #fff;
          color: #000;
          border: none;
          font-weight: 800;
          font-size: 12px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;

          @media (max-width: 900px) {
            align-self: flex-start;
          }

          &:hover {
            background: #10b981;
            color: #fff;
          }
        }
      }
    }
  }
}

/* GUEST LOOKUP CARD */
.guest-lookup-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: none;
  padding: 16px 20px;
  margin-bottom: 24px;

  .lookup-form {
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 700px) {
      flex-direction: column;
      align-items: stretch;
    }

    .lookup-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      padding: 0 14px;
      height: 44px;

      &:focus-within {
        border-color: #000;
        background: #fff;
      }

      .lookup-icon {
        color: #64748b;
        font-size: 16px;
        margin-right: 10px;
        display: flex;
      }

      .lookup-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
      }
    }

    .btn-lookup-submit {
      height: 44px;
      padding: 0 24px;
      background: #000;
      color: #fff;
      border: 2px solid #000;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #10b981;
        border-color: #10b981;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

/* STATUS TABS */
.orders-nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;

  .order-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: #475569;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      border-color: #000;
      color: #000;
    }

    &.active {
      background: #000;
      color: #fff;
      border-color: #000;
      box-shadow: none;

      .tab-badge {
        background: #fff;
        color: #000;
      }
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: #f1f5f9;
      color: #334155;
      font-size: 11px;
      font-weight: 800;
      border-radius: 10px;
    }
  }
}

/* FILTER & SEARCH BAR */
.orders-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: none;
  padding: 14px 18px;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-search-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    padding: 0 12px;
    height: 38px;

    &:focus-within {
      border-color: #000;
      background: #fff;
    }

    .search-icon {
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    .filter-search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .filter-right-controls {
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: space-between;

      :deep(.el-select) {
        flex: 1;
        width: auto !important;
      }
    }

    .btn-control-refresh {
      height: 38px;
      padding: 0 16px;
      background: #fff;
      border: 1px solid #cbd5e1;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #000;
      }
    }
  }
}

/* ORDERS CARDS LIST */
.orders-cards-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  /* CARD HEADER */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    gap: 12px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .card-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .order-code-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #000;
        color: #fff;
        padding: 4px 10px;
        font-family: monospace;
        font-weight: 800;
        font-size: 14px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #10b981;
        }

        .copy-icon {
          font-size: 12px;
        }
      }

      .order-date-text {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
      }

      .order-type-tag {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 3px;
        border: 1px solid transparent;

        &.store {
          background: #e0f2fe;
          color: #0369a1;
        }

        &.online {
          background: #ecfdf5;
          color: #047857;
        }
      }
    }

    .card-header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .payment-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #fff;

        &.bank {
          border-color: #3b82f6;
          color: #1d4ed8;
          background: #eff6ff;
        }

        &.cash {
          border-color: #64748b;
          color: #334155;
        }
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-radius: 4px;
        border: 1px solid transparent;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        &.pending {
          background: #fef3c7;
          color: #b45309;
          border-color: #f59e0b;
          .status-dot { background: #d97706; }
        }

        &.confirmed {
          background: #dbeafe;
          color: #1d4ed8;
          border-color: #3b82f6;
          .status-dot { background: #2563eb; }
        }

        &.shipping {
          background: #ede9fe;
          color: #6d28d9;
          border-color: #8b5cf6;
          .status-dot { background: #7c3aed; }
        }

        &.completed {
          background: #d1fae5;
          color: #047857;
          border-color: #10b981;
          .status-dot { background: #059669; }
        }

        &.cancelled {
          background: #ffe4e6;
          color: #be123c;
          border-color: #f43f5e;
          .status-dot { background: #e11d48; }
        }
      }
    }
  }

  /* CARD ITEMS LIST */
  .card-items-list {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e2e8f0;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .item-thumb-box {
        width: 64px;
        height: 64px;
        flex-shrink: 0;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow: hidden;

        .item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;

          &.placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            color: #94a3b8;
          }
        }
      }

      .item-details {
        flex: 1;
        min-width: 0;

        .item-name {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-specs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;

          .sku-tag {
            font-family: monospace;
            background: #f1f5f9;
            color: #475569;
            padding: 2px 6px;
            font-weight: 700;
          }

          .spec-pill {
            background: #000;
            color: #fff;
            padding: 2px 6px;
            font-weight: 700;
          }

          .spec-color {
            color: #64748b;
            font-weight: 600;
          }
        }
      }

      .item-calc {
        text-align: right;
        flex-shrink: 0;

        .item-calc-formula {
          display: block;
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .item-subtotal {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
        }

        .btn-item-review {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #0f172a;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover {
            background: #0f172a;
            color: #ffffff;
          }
        }
      }
    }
  }

  /* CARD RECIPIENT & NOTE BAR */
  .card-meta-bar {
    padding: 10px 20px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;

    .meta-col {
      display: flex;
      gap: 6px;

      .meta-label {
        color: #64748b;
        font-weight: 600;
      }

      .meta-value {
        color: #1e293b;

        .meta-address {
          color: #475569;
        }

        &.note-text {
          font-style: italic;
          color: #b45309;
        }
      }
    }
  }

  /* CARD FOOTER & ACTIONS */
  .card-footer {
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .card-footer-left {
      .footer-total-block {
        display: flex;
        align-items: baseline;
        gap: 8px;

        @media (max-width: 768px) {
          justify-content: space-between;
        }

        .total-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }

        .total-amount {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
      }
    }

    .card-footer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        width: 100%;

        .btn-card-action {
          flex: 1 1 calc(50% - 8px);
          justify-content: center;
          text-align: center;
        }
      }

      .btn-card-action {
        height: 36px;
        padding: 0 14px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.3px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;

        &.secondary {
          background: #fff;
          color: #0f172a;

          &:hover {
            background: #f1f5f9;
            border-color: #94a3b8;
          }
        }

        &.review-highlight {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;

          &:hover {
            background: #000000;
            border-color: #000000;
          }
        }

        &.qr-pay {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;

          &:hover {
            background: #2563eb;
            border-color: #2563eb;
            color: #fff;
          }
        }

        &.danger {
          background: #fff;
          border-color: #fecdd3;
          color: #e11d48;

          &:hover {
            background: #e11d48;
            border-color: #e11d48;
            color: #fff;
          }
        }

        &.primary {
          background: #000;
          border-color: #000;
          color: #fff;

          &:hover {
            background: #10b981;
            border-color: #10b981;
          }
        }
      }
    }
  }
}

/* EMPTY STATE */
.orders-empty-state {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: none;
  padding: 64px 24px;
  text-align: center;

  .empty-icon-box {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-svg {
      width: 56px;
      height: 56px;
    }
  }

  .empty-title {
    font-size: 18px;
    font-weight: 900;
    margin: 0 0 8px 0;
    color: #0f172a;
  }

  .empty-desc {
    font-size: 14px;
    color: #64748b;
    max-width: 480px;
    margin: 0 auto 24px;
    line-height: 1.5;
  }

  .btn-empty-shop {
    background: #000;
    color: #fff;
    border: 1px solid #000;
    border-radius: 4px;
    font-weight: 800;
    font-size: 13px;
    padding: 12px 24px;
    cursor: pointer;
    box-shadow: none;
    transition: all 0.2s;

    &:hover {
      background: #10b981;
      border-color: #10b981;
      box-shadow: none;
    }
  }

  .btn-empty-reset {
    background: #fff;
    color: #000;
    border: 2px solid #000;
    font-weight: 800;
    font-size: 13px;
    padding: 10px 20px;
    cursor: pointer;

    &:hover {
      background: #f1f5f9;
    }
  }
}

/* DRAWER STYLES */
.drawer-inner {
  padding: 6px 4px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .drawer-hero-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 18px;

    .hero-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .drawer-kicker {
        font-size: 11px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 1px;
      }

      .drawer-code {
        font-size: 22px;
        font-weight: 900;
        font-family: monospace;
        margin: 2px 0 0 0;
      }
    }

    .hero-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 12px;

      .hero-meta-item {
        display: flex;
        flex-direction: column;

        .label {
          color: #64748b;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .val {
          color: #0f172a;
          font-weight: 700;
        }
      }
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0 0 14px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #000;
    padding-bottom: 6px;
  }

  /* TIMELINE */
  .timeline-stepper {
    display: flex;
    flex-direction: column;
    padding-left: 12px;

    .timeline-item {
      position: relative;
      padding-left: 24px;
      padding-bottom: 20px;
      border-left: 2px solid #000;

      &.is-last {
        border-left: 2px solid transparent;
        padding-bottom: 0;
      }

      .timeline-marker {
        position: absolute;
        left: -7px;
        top: 0;
        width: 12px;
        height: 12px;
        background: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .marker-dot {
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
        }
      }

      .timeline-content {
        .timeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;

          .timeline-status {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }

          .timeline-time {
            font-size: 11px;
            color: #64748b;
            font-family: monospace;
          }
        }

        .timeline-note {
          font-size: 13px;
          color: #475569;
          margin: 0 0 4px 0;
          line-height: 1.4;
        }

        .timeline-actor {
          font-size: 11px;
          color: #94a3b8;
          font-style: italic;
        }
      }
    }
  }

  /* DRAWER ITEMS */
  .drawer-items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .drawer-item-row {
      display: flex;
      gap: 12px;
      padding: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;

      .drawer-item-thumb {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border: 1px solid #000;
        flex-shrink: 0;

        &.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
        }
      }

      .drawer-item-meta {
        flex: 1;

        .drawer-item-title {
          font-size: 13px;
          font-weight: 800;
          margin: 0 0 4px 0;
        }

        .drawer-item-tags {
          display: flex;
          gap: 6px;
          margin-bottom: 4px;

          .sku-tag {
            font-size: 11px;
            font-family: monospace;
            background: #fff;
            padding: 1px 4px;
            border: 1px solid #cbd5e1;
          }

          .spec-pill {
            font-size: 11px;
            background: #000;
            color: #fff;
            padding: 1px 4px;
          }

          .spec-color {
            font-size: 11px;
            color: #64748b;
          }
        }

        .drawer-item-sub {
          font-size: 12px;
          color: #0f172a;
        }

        .btn-drawer-review {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #0f172a;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover {
            background: #0f172a;
            color: #ffffff;
          }
        }
      }
    }
  }

  /* DRAWER SUMMARY */
  .drawer-summary-section {
    padding: 16px;
    background: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 13px;

      &.final {
        margin-top: 6px;
        padding-top: 8px;
        border-top: 1px solid #3f3f46;
        font-size: 15px;
        font-weight: 900;

        .final-price {
          color: #10b981;
          font-size: 18px;
        }
      }
    }
  }
}

/* VIETQR DIALOG */
.vietqr-dialog {
  .qr-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    .qr-notice-box {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      padding: 10px 14px;
      text-align: center;
      width: 100%;

      .qr-notice-kicker {
        font-size: 11px;
        font-weight: 900;
        color: #1d4ed8;
        display: block;
        margin-bottom: 2px;
      }

      .qr-notice-text {
        font-size: 12px;
        color: #1e40af;
        margin: 0;
        line-height: 1.4;
      }
    }

    .qr-image-wrapper {
      padding: 10px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: none;

      .vietqr-img {
        max-width: 240px;
        height: auto;
        display: block;
      }
    }

    .bank-details-card {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;

      .bank-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .bank-lbl {
          color: #64748b;
          font-weight: 600;
        }

        .bank-val {
          color: #0f172a;
          font-weight: 700;

          &.mono {
            font-family: monospace;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;

            &:hover {
              color: #2563eb;
            }
          }

          &.price {
            color: #dc2626;
            font-size: 15px;
          }

          &.memo {
            background: #fef3c7;
            padding: 2px 6px;
            border: 1px solid #f59e0b;
          }
        }
      }
    }

    .btn-close-qr {
      width: 100%;
      height: 44px;
      background: #000;
      color: #fff;
      border: 1px solid #000;
      border-radius: 4px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      box-shadow: none;

      &:hover {
        background: #10b981;
        border-color: #10b981;
      }

      &.success {
        background: #10b981;
        border-color: #10b981;
        &:hover {
          background: #059669;
          border-color: #059669;
        }
      }
    }

    .qr-paid-success-box {
      width: 100%;
      background: #f0fdf4;
      border: 1px solid #10b981;
      padding: 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .paid-check-circle {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #10b981;
        color: #ffffff;
        font-size: 26px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      }

      .paid-title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: #065f46;
      }

      .paid-sub {
        margin: 0;
        font-size: 12px;
        color: #047857;
        line-height: 1.5;
        max-width: 320px;
      }

      .paid-amount-row {
        background: #d1fae5;
        border: 1px dashed #34d399;
        padding: 6px 14px;
        border-radius: 4px;
        display: flex;
        gap: 8px;
        font-size: 13px;
        color: #065f46;

        strong {
          font-weight: 800;
          color: #047857;
        }
      }
    }

    .qr-modal-radar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      padding: 6px 12px;
      border-radius: 4px;
      width: 100%;

      .radar-ping {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        animation: radarPulse 1.5s infinite;
      }

      .radar-text {
        font-size: 11px;
        color: #475569;
        font-weight: 600;
      }
    }

    @keyframes radarPulse {
      0% { opacity: 0.3; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.3); }
      100% { opacity: 0.3; transform: scale(0.9); }
    }
  }
}

/* CANCEL ORDER DIALOG */
.cancel-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .cancel-warning-banner {
    display: flex;
    gap: 12px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    padding: 12px 14px;
    align-items: flex-start;

    .warn-icon {
      font-size: 20px;
      color: #e11d48;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warn-text {
      font-size: 13px;
      color: #9f1239;

      strong {
        display: block;
        margin-bottom: 2px;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #be123c;
      }
    }
  }

  .cancel-reason-form {
    .reason-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .reason-radio-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .custom-note-input {
      margin-top: 6px;
    }
  }

  .cancel-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;

    .btn-cancel-back {
      padding: 10px 18px;
      background: #fff;
      border: 2px solid #cbd5e1;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: #f1f5f9;
      }
    }

    .btn-cancel-confirm {
      padding: 10px 18px;
      background: #e11d48;
      border: 2px solid #e11d48;
      color: #fff;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover:not(:disabled) {
        background: #be123c;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
