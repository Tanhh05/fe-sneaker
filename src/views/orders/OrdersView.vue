<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Quản lý Đơn hàng Bán lẻ</h2>
        <p class="page-subtitle">Theo dõi danh sách đơn hàng, luồng chuyển trạng thái hợp lệ (DRAFT &rarr; CONFIRMED &rarr; COMPLETED / CANCELLED) và in hóa đơn</p>
      </div>
      <el-button type="primary" @click="$router.push('/sales')">
        <el-icon style="margin-right: 6px"><Plus /></el-icon> Tạo đơn mới tại POS
      </el-button>
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
          <el-select v-model="filters.status" placeholder="Trạng thái đơn" clearable style="width: 100%" @change="loadData">
            <el-option label="Nháp (DRAFT)" value="DRAFT" />
            <el-option label="Đã xác nhận (CONFIRMED)" value="CONFIRMED" />
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
        <el-table-column label="Mã đơn hàng" width="130">
          <template #default="{ row }">
            <span class="code-badge">{{ row.orderCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="Khách hàng" min-width="175" />
        <el-table-column prop="customerPhone" label="SĐT Khách" width="125" />
        <el-table-column label="Kênh bán / Nhân viên" width="170">
          <template #default="{ row }">
            <el-tag v-if="!row.employeeName" size="small" type="info" effect="plain" class="online-tag">
              ONLINE STORE
            </el-tag>
            <span v-else>{{ row.employeeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày tạo" width="155">
          <template #default="{ row }">{{ formatDateTime(row.orderDate) }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="150" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.finalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Phương thức TT" width="165">
          <template #default="{ row }">
            {{ PAYMENT_METHOD_MAP[row.paymentMethod] || row.paymentMethod }}
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="145" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_MAP[row.status]?.type || 'info'">
              {{ ORDER_STATUS_MAP[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <button class="action-btn" @click="openDetail(row)">
                <el-icon><View /></el-icon>
                <span>Chi tiết</span>
              </button>
              <button class="action-btn" @click="openPrint(row)">
                <el-icon><Printer /></el-icon>
                <span>In HĐ</span>
              </button>
              <el-dropdown
                v-if="row.status === 'DRAFT' || row.status === 'CONFIRMED'"
                trigger="click"
                @command="(status) => handleStatusCommand(row, status)"
              >
                <button class="action-btn action-more">
                  <span>Xử lý ▾</span>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-if="row.status === 'DRAFT'"
                      command="CONFIRMED"
                    >
                      ✓ Xác nhận đơn
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'DRAFT' || row.status === 'CONFIRMED'"
                      command="COMPLETED"
                    >
                      ✓ Hoàn thành đơn
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'DRAFT' || row.status === 'CONFIRMED'"
                      command="CANCELLED"
                      divided
                      style="color: #ef4444"
                    >
                      ✕ Hủy đơn hàng
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

    <!-- Order Detail & Status History Modal -->
    <OrderDetailDialog
      v-model="detailVisible"
      :order="selectedOrder"
      @print="openPrintFromDetail"
    />

    <!-- Printable Invoice Modal -->
    <InvoicePrintModal v-model="invoiceVisible" :order="selectedOrder" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Printer } from '@element-plus/icons-vue'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/constants'
import { useDebouncedWatch } from '@/composables/useDebounce'
import InvoicePrintModal from '@/components/InvoicePrintModal.vue'
import OrderDetailDialog from './components/OrderDetailDialog.vue'

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

const detailVisible = ref(false)
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

async function openDetail(row) {
  const res = await orderService.getOrderById(row.id)
  selectedOrder.value = res.data
  detailVisible.value = true
}

async function openPrint(row) {
  const res = await orderService.getOrderById(row.id)
  selectedOrder.value = res.data
  invoiceVisible.value = true
}

function openPrintFromDetail() {
  detailVisible.value = false
  invoiceVisible.value = true
}

function changeStatus(row, targetStatus, actionTitle) {
  ElMessageBox.prompt(
    `Nhập ghi chú cho thao tác "${actionTitle}" đối với đơn hàng ${row.orderCode}:`,
    actionTitle,
    {
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      inputValue: `${actionTitle} tại quầy`
    }
  ).then(async ({ value }) => {
    await orderService.updateOrderStatus(row.id, {
      status: targetStatus,
      note: value
    })
    ElMessage.success(`Đã cập nhật trạng thái đơn ${row.orderCode} sang ${targetStatus}`)
    loadData()
  }).catch(() => {})
}

function handleStatusCommand(row, targetStatus) {
  const map = {
    CONFIRMED: 'Xác nhận đơn hàng',
    COMPLETED: 'Hoàn thành đơn hàng',
    CANCELLED: 'Hủy đơn hàng'
  }
  changeStatus(row, targetStatus, map[targetStatus] || targetStatus)
}

onMounted(() => {
  loadData()
})
</script>
