<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Đơn hàng Bán lẻ</h2>
        <p class="page-subtitle">Theo dõi danh sách đơn hàng, luồng chuyển trạng thái (Chờ xác nhận &rarr; Đã xác nhận &rarr; Đang giao hàng &rarr; Hoàn thành / Hủy) và in hóa đơn</p>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="loadData">
          <el-icon style="margin-right: 6px"><Refresh /></el-icon> Làm mới dữ liệu
        </el-button>
        <el-button type="primary" @click="$router.push('/pos')">
          <el-icon style="margin-right: 6px"><Plus /></el-icon> Tạo đơn mới tại POS
        </el-button>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="8" :md="6">
          <el-input
            v-model="filters.keyword"
            placeholder="Mã đơn (HDxxxx), tên KH, SĐT..."
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="6" :md="5">
          <el-select v-model="filters.status" placeholder="Tất cả trạng thái" clearable style="width: 100%" @change="loadData">
            <el-option label="Tất cả trạng thái" value="" />
            <el-option label="Chờ xác nhận (PENDING)" value="PENDING" />
            <el-option label="Đơn nháp (DRAFT)" value="DRAFT" />
            <el-option label="Đã xác nhận (CONFIRMED)" value="CONFIRMED" />
            <el-option label="Đang giao hàng (SHIPPING)" value="SHIPPING" />
            <el-option label="Hoàn thành (COMPLETED)" value="COMPLETED" />
            <el-option label="Đã hủy (CANCELLED)" value="CANCELLED" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-date-picker
            v-model="filters.fromDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Từ ngày"
            style="width: 100%"
            @change="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-date-picker
            v-model="filters.toDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Đến ngày"
            style="width: 100%"
            @change="loadData"
          />
        </el-col>
        <el-col :xs="12" :sm="24" :md="5">
          <el-button type="primary" @click="loadData">Lọc đơn</el-button>
          <el-button @click="resetFilter">Làm mới</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Table -->
    <div class="table-card" v-loading="loading">
      <el-table :data="items" stripe border style="width: 100%">
        <template #empty>
          <el-empty description="Không tìm thấy đơn hàng phù hợp" :image-size="84" />
        </template>
        <el-table-column label="Mã đơn hàng" width="130" align="center">
          <template #default="{ row }">
            <span class="code-badge">{{ row.orderCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="Khách hàng" min-width="150" />
        <el-table-column prop="customerPhone" label="SĐT Khách" width="110" />
        <el-table-column label="Kênh bán / Nhân viên" width="135">
          <template #default="{ row }">
            <el-tag v-if="!row.employeeName" size="small" type="info" effect="plain" class="online-tag">
              ONLINE STORE
            </el-tag>
            <span v-else>{{ row.employeeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày tạo" width="135">
          <template #default="{ row }">{{ formatDateTime(row.orderDate) }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="120" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.finalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Phương thức TT" width="145">
          <template #default="{ row }">
            <div>{{ PAYMENT_METHOD_MAP[row.paymentMethod] || row.paymentMethod }}</div>
            <div v-if="row.paymentMethod === 'BANK_TRANSFER' && (row.status === 'CONFIRMED' || row.status === 'COMPLETED')">
              <el-tag size="small" type="success" effect="dark" style="font-size: 10px; height: 18px; line-height: 18px; margin-top: 3px; font-weight: 700">
                SePay Khớp Lệnh
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="135" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_MAP[row.status]?.type || 'info'">
              {{ ORDER_STATUS_MAP[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="115" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <button class="action-btn" title="Xem chi tiết đơn hàng" @click="openDetail(row)">
                <el-icon><View /></el-icon>
              </button>
              <button class="action-btn" title="In hóa đơn bán lẻ" @click="openPrint(row)">
                <el-icon><Printer /></el-icon>
              </button>
              <el-dropdown
                v-if="row.status !== 'COMPLETED' && row.status !== 'CANCELLED'"
                trigger="click"
                @command="(status) => handleStatusCommand(row, status)"
              >
                <button class="action-btn action-more" title="Chuyển trạng thái đơn">
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- Đơn DRAFT hoặc PENDING: Xác nhận đơn -->
                    <el-dropdown-item
                      v-if="row.status === 'DRAFT' || row.status === 'PENDING'"
                      command="CONFIRMED"
                      style="color: #2563eb; font-weight: 700"
                    >
                      ✓ Xác nhận đơn
                    </el-dropdown-item>
                    <!-- Đơn CONFIRMED: Bắt đầu giao hàng -->
                    <el-dropdown-item
                      v-if="row.status === 'CONFIRMED'"
                      command="SHIPPING"
                      style="color: #d97706; font-weight: 700"
                    >
                      🚚 Bắt đầu giao hàng
                    </el-dropdown-item>
                    <!-- Đơn có thể hoàn thành -->
                    <el-dropdown-item
                      v-if="['CONFIRMED', 'SHIPPING', 'DRAFT', 'PENDING'].includes(row.status)"
                      command="COMPLETED"
                      style="color: #10b981; font-weight: 700"
                    >
                      ✓ Hoàn thành đơn
                    </el-dropdown-item>
                    <!-- Hủy đơn -->
                    <el-dropdown-item
                      command="CANCELLED"
                      divided
                      style="color: #ef4444"
                    >
                      ✕ Hủy đơn hàng
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <button
                v-else
                type="button"
                class="action-btn action-more is-disabled"
                disabled
                title="Đơn hàng đã hoàn tất hoặc đã hủy, không thể chuyển trạng thái"
              >
                <el-icon><MoreFilled /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- Printable Invoice Modal -->
    <InvoicePrintModal v-model="invoiceVisible" :order="selectedOrder" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Printer, MoreFilled, Refresh } from '@element-plus/icons-vue'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/constants'
import { useDebouncedWatch } from '@/composables/useDebounce'
import InvoicePrintModal from '@/components/InvoicePrintModal.vue'

const router = useRouter()
const loading = ref(false)
const items = ref([])

const filters = reactive({
  keyword: '',
  status: '',
  fromDate: null,
  toDate: null
})

const pagination = reactive({ page: 1, size: 10, total: 0 })

useDebouncedWatch(
  () => filters.keyword,
  () => {
    pagination.page = 1
    loadData()
  },
  350
)

const invoiceVisible = ref(false)
const selectedOrder = ref(null)

async function loadData() {
  loading.value = true
  try {
    const res = await orderService.getOrders({
      keyword: filters.keyword,
      status: filters.status,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: pagination.page - 1,
      size: pagination.size
    })
    items.value = res.data.content || []
    pagination.total = res.data.totalElements || 0
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.keyword = ''
  filters.status = ''
  filters.fromDate = null
  filters.toDate = null
  pagination.page = 1
  loadData()
}

function openDetail(row) {
  router.push(`/admin/orders/${row.id}`)
}

async function openPrint(row) {
  const res = await orderService.getOrderById(row.id)
  selectedOrder.value = res.data
  invoiceVisible.value = true
}

function changeStatus(row, targetStatus, actionTitle, callback) {
  const defaultNotes = {
    CONFIRMED: 'Nhân viên đã kiểm tra và xác nhận đơn hàng',
    SHIPPING: 'Đơn hàng đã bàn giao cho đơn vị vận chuyển',
    COMPLETED: 'Đơn hàng đã được giao thành công và hoàn tất thanh toán',
    CANCELLED: 'Khách hàng / Nhân viên hủy đơn'
  }
  ElMessageBox.prompt(
    `Nhập ghi chú cho thao tác "${actionTitle}" đối với đơn hàng ${row.orderCode}:`,
    actionTitle,
    {
      confirmButtonText: 'Xác nhận thực hiện',
      cancelButtonText: 'Đóng',
      inputValue: defaultNotes[targetStatus] || `${actionTitle} tại hệ thống`
    }
  ).then(async ({ value }) => {
    const res = await orderService.updateOrderStatus(row.id, {
      status: targetStatus,
      note: value
    })
    ElMessage.success(`Đã cập nhật trạng thái đơn ${row.orderCode} sang "${ORDER_STATUS_MAP[targetStatus]?.label || targetStatus}"`)
    if (callback) callback(res.data)
    loadData()
  }).catch(() => {})
}

function handleStatusCommand(row, targetStatus) {
  const map = {
    CONFIRMED: 'Xác nhận đơn hàng',
    SHIPPING: 'Bắt đầu giao hàng',
    COMPLETED: 'Hoàn thành đơn hàng',
    CANCELLED: 'Hủy đơn hàng'
  }
  changeStatus(row, targetStatus, map[targetStatus] || targetStatus)
}

async function silentRefresh() {
  try {
    const res = await orderService.getOrders({
      keyword: filters.keyword,
      status: filters.status,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: pagination.page - 1,
      size: pagination.size
    })
    items.value = res.data.content || []
    pagination.total = res.data.totalElements || 0
  } catch (e) {
    // silent background polling
  }
}

let autoRefreshTimer = null

onMounted(() => {
  loadData()
  autoRefreshTimer = setInterval(() => {
    if (!loading.value && !invoiceVisible.value) {
      silentRefresh()
    }
  }, 4000)
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
})
</script>
