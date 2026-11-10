<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Dashboard – Tổng Quan Hoạt Động Cửa Hàng</h2>
        <p class="page-subtitle">Dữ liệu thời gian thực trực tiếp từ Oracle Database 19c+</p>
      </div>
      <div>
        <el-button @click="loadDashboard">
          <el-icon style="margin-right: 6px"><Refresh /></el-icon> Làm mới dữ liệu
        </el-button>
        <el-button type="primary" @click="$router.push('/sales')">
          <el-icon style="margin-right: 6px"><ShoppingCart /></el-icon> Mở màn hình POS
        </el-button>
      </div>
    </div>

    <!-- Revenue Highlight Banner -->
    <div class="revenue-kpi-row">
      <div class="rev-card dark">
        <div class="rev-label">DOANH THU HÔM NAY</div>
        <div class="rev-value">{{ formatCurrency(data.todayRevenue) }}</div>
        <div class="rev-sub">Chỉ tính đơn hàng hoàn thành (COMPLETED)</div>
      </div>
      <div class="rev-card accent">
        <div class="rev-label">DOANH THU THÁNG NÀY</div>
        <div class="rev-value">{{ formatCurrency(data.monthRevenue) }}</div>
        <div class="rev-sub">Tổng hợp doanh thu tháng hiện tại</div>
      </div>
      <div class="rev-card blue">
        <div class="rev-label">TỔNG DOANH THU LŨY KẾ</div>
        <div class="rev-value">{{ formatCurrency(data.totalRevenue) }}</div>
        <div class="rev-sub">Toàn bộ đơn hàng đã hoàn thành</div>
      </div>
    </div>

    <!-- 6 Operational KPI Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-title">Tổng số sản phẩm</div>
        <div class="stat-num">{{ data.totalProducts }}</div>
        <div class="stat-meta">Mẫu giày trong danh mục</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Sản phẩm đang kinh doanh</div>
        <div class="stat-num text-success">{{ data.activeProducts }}</div>
        <div class="stat-meta">Trạng thái ACTIVE</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tổng số đơn hàng</div>
        <div class="stat-num">{{ data.totalOrders }}</div>
        <div class="stat-meta">Tất cả trạng thái</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Đơn hàng chờ xử lý</div>
        <div class="stat-num text-warning">{{ data.pendingOrders }}</div>
        <div class="stat-meta">DRAFT &amp; CONFIRMED</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tổng số khách hàng</div>
        <div class="stat-num">{{ data.totalCustomers }}</div>
        <div class="stat-meta">Khách hàng thành viên</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tổng số nhân viên</div>
        <div class="stat-num">{{ data.totalEmployees }}</div>
        <div class="stat-meta">Nhân sự cửa hàng</div>
      </div>
    </div>

    <!-- Charts Section -->
    <el-row :gutter="18">
      <!-- Revenue Bar Chart -->
      <el-col :xs="24" :lg="15">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Biểu đồ Doanh thu ({{ chartModeLabel }})</h3>
              <p>Thống kê doanh thu thực tế từ đơn hoàn thành</p>
            </div>
            <el-radio-group v-model="chartMode" size="small">
              <el-radio-button label="DAY">Theo ngày</el-radio-button>
              <el-radio-button label="MONTH">Theo tháng</el-radio-button>
              <el-radio-button label="YEAR">Theo năm</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="activeRevenueSeries.length === 0" class="empty-box">
            <el-empty description="Chưa có dữ liệu doanh thu" :image-size="80" />
          </div>
          <div v-else class="bar-chart-container">
            <div
              v-for="item in activeRevenueSeries"
              :key="item.period"
              class="bar-column"
            >
              <div class="bar-value">{{ formatShortCurrency(item.revenue) }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: calcBarHeight(item.revenue) + '%' }"
                  :title="`${item.period}: ${formatCurrency(item.revenue)} (${item.orderCount} đơn)`"
                ></div>
              </div>
              <div class="bar-label">{{ item.period }}</div>
              <div class="bar-sub">{{ item.orderCount }} đơn · {{ item.quantitySold }} đôi</div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Order Status Distribution Chart -->
      <el-col :xs="24" :lg="9">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Số lượng Đơn hàng theo Trạng thái</h3>
              <p>Tỷ trọng và giá trị theo từng trạng thái đơn</p>
            </div>
          </div>

          <div v-if="(data.orderStatusCounts || []).length === 0" class="empty-box">
            <el-empty description="Chưa có đơn hàng" :image-size="80" />
          </div>
          <div v-else class="status-bars">
            <div
              v-for="st in data.orderStatusCounts"
              :key="st.status"
              class="status-row"
            >
              <div class="status-info">
                <el-tag :type="ORDER_STATUS_MAP[st.status]?.type || 'info'" size="small" effect="dark">
                  {{ ORDER_STATUS_MAP[st.status]?.label || st.status }}
                </el-tag>
                <span class="status-count">
                  <strong>{{ st.count }}</strong> đơn ({{ formatCurrency(st.totalAmount) }})
                </span>
              </div>
              <el-progress
                :percentage="calcStatusPercent(st.count)"
                :stroke-width="12"
                :color="statusColor(st.status)"
              />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Top Selling Products Table -->
    <div class="table-card">
      <div class="section-head">
        <h3>Top Sản Phẩm Sneaker Bán Chạy Nhất</h3>
        <el-button text type="primary" @click="$router.push('/reports')">
          Xem báo cáo chi tiết &rarr;
        </el-button>
      </div>
      <el-table :data="data.topSellingProducts || []" stripe border style="width: 100%">
        <el-table-column type="index" label="Hạng" width="70" align="center" />
        <el-table-column label="Mã SP" width="120">
          <template #default="{ row }">
            <span class="code-badge">{{ row.productCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="Tên sản phẩm Sneaker" min-width="220" />
        <el-table-column prop="brandName" label="Thương hiệu" width="150" />
        <el-table-column prop="categoryName" label="Danh mục" width="150" />
        <el-table-column prop="quantitySold" label="Số đôi đã bán" width="140" align="center">
          <template #default="{ row }">
            <el-tag type="success" effect="plain"><strong>{{ row.quantitySold }}</strong> đôi</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Doanh thu mang lại" width="190" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.revenue) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Refresh, ShoppingCart } from '@element-plus/icons-vue'
import { reportService } from '@/services/reportService'
import { formatCurrency } from '@/utils/formatters'
import { ORDER_STATUS_MAP } from '@/constants'

const loading = ref(false)
const chartMode = ref('DAY')

const data = ref({
  totalProducts: 0,
  activeProducts: 0,
  totalCustomers: 0,
  totalEmployees: 0,
  totalOrders: 0,
  pendingOrders: 0,
  todayRevenue: 0,
  monthRevenue: 0,
  totalRevenue: 0,
  topSellingProducts: [],
  revenueByDay: [],
  revenueByMonth: [],
  revenueByYear: [],
  orderStatusCounts: []
})

const chartModeLabel = computed(() => {
  if (chartMode.value === 'MONTH') return 'Theo tháng'
  if (chartMode.value === 'YEAR') return 'Theo năm'
  return 'Theo ngày'
})

const activeRevenueSeries = computed(() => {
  if (chartMode.value === 'MONTH') return data.value.revenueByMonth || []
  if (chartMode.value === 'YEAR') return data.value.revenueByYear || []
  return data.value.revenueByDay || []
})

const maxRevenue = computed(() => {
  const nums = activeRevenueSeries.value.map((i) => Number(i.revenue || 0))
  return Math.max(...nums, 1)
})

function calcBarHeight(rev) {
  const pct = Math.round((Number(rev || 0) / maxRevenue.value) * 100)
  return Math.max(pct, 10)
}

function formatShortCurrency(val) {
  const n = Number(val || 0)
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return n.toString()
}

function calcStatusPercent(count) {
  const total = data.value.totalOrders || 1
  return Math.min(100, Math.round((Number(count || 0) / total) * 100))
}

function statusColor(status) {
  switch (status) {
    case 'COMPLETED':
      return '#16a34a'
    case 'CONFIRMED':
      return '#f97316'
    case 'CANCELLED':
      return '#dc2626'
    default:
      return '#64748b'
  }
}

async function loadDashboard() {
  loading.value = true
  try {
    const res = await reportService.getDashboard()
    data.value = res.data || data.value
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped lang="scss">
.revenue-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;

  .rev-card {
    padding: 22px 24px;
    border-radius: 14px;
    color: #ffffff;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);

    &.dark {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-left: 5px solid #f97316;
    }
    &.accent {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    }
    &.blue {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    }

    .rev-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      opacity: 0.85;
    }
    .rev-value {
      font-size: 26px;
      font-weight: 800;
      margin: 8px 0 4px;
    }
    .rev-sub {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 14px;

  .stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 18px;

    .stat-title {
      font-size: 12.5px;
      font-weight: 600;
      color: #64748b;
    }
    .stat-num {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 2px;
      &.text-success {
        color: #16a34a;
      }
      &.text-warning {
        color: #ea580c;
      }
    }
    .stat-meta {
      font-size: 11.5px;
      color: #94a3b8;
    }
  }
}

.chart-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  min-height: 330px;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18px;
    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    p {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
  }
}

.bar-chart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 18px;
  padding: 16px 8px 6px;
  overflow-x: auto;

  .bar-column {
    flex: 1;
    min-width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .bar-value {
      font-size: 12px;
      font-weight: 700;
      color: #ea580c;
      margin-bottom: 6px;
    }

    .bar-track {
      width: 44px;
      height: 170px;
      background: #f1f5f9;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;

      .bar-fill {
        width: 100%;
        background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
        border-radius: 8px 8px 0 0;
        transition: height 0.35s ease;
      }
    }

    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .bar-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
  }
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;

  .status-row {
    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 13px;
    }
  }
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }
}
</style>
