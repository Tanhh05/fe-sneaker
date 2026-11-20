<template>
  <div class="page-container" v-loading="loading">
    <!-- Header -->
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">TỔNG QUAN HOẠT ĐỘNG KINH DOANH</h2>
        <p class="page-subtitle">Dữ liệu doanh thu & chỉ số vận hành thời gian thực từ Oracle Database</p>
      </div>
      <div class="header-actions-group">
        <el-button @click="loadDashboard" class="btn-refresh">
          <el-icon style="margin-right: 6px"><Refresh /></el-icon> CẬP NHẬT
        </el-button>
        <button class="btn-primary-header" @click="$router.push('/pos')">
          <el-icon style="margin-right: 6px"><ShoppingCart /></el-icon> MỞ MÀN HÌNH POS
        </button>
      </div>
    </div>

    <!-- Revenue Key Metrics Grid -->
    <div class="revenue-kpi-row">
      <div class="rev-card card-primary-dark">
        <div class="rev-eyebrow">
          <span>DOANH THU HÔM NAY</span>
          <span class="live-dot-tag"><span class="dot"></span> REALTIME</span>
        </div>
        <div class="rev-value">{{ formatCurrency(data.todayRevenue) }}</div>
        <div class="rev-sub">Ghi nhận từ các đơn hàng hoàn tất (COMPLETED) trong ngày</div>
      </div>

      <div class="rev-card card-white">
        <div class="rev-eyebrow">
          <span>DOANH THU THÁNG HIỆN TẠI</span>
          <span class="period-tag">THÁNG NÀY</span>
        </div>
        <div class="rev-value">{{ formatCurrency(data.monthRevenue) }}</div>
        <div class="rev-sub">Doanh số cộng dồn chu kỳ tháng</div>
      </div>

      <div class="rev-card card-white">
        <div class="rev-eyebrow">
          <span>TỔNG DOANH THU LŨY KẾ</span>
          <span class="period-tag">ALL-TIME</span>
        </div>
        <div class="rev-value">{{ formatCurrency(data.totalRevenue) }}</div>
        <div class="rev-sub">Tổng giá trị đơn hàng hoàn thành từ khi khởi tạo</div>
      </div>
    </div>

    <!-- 6 Operational KPI Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-title">TỔNG MẪU SẢN PHẨM</div>
        <div class="stat-num">{{ data.totalProducts }}</div>
        <div class="stat-meta">Mẫu giày lưu trữ</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">ĐANG KINH DOANH</div>
        <div class="stat-num text-active">{{ data.activeProducts }}</div>
        <div class="stat-meta">Trạng thái ACTIVE</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">TỔNG ĐƠN HÀNG</div>
        <div class="stat-num">{{ data.totalOrders }}</div>
        <div class="stat-meta">Bao gồm POS & Online</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">ĐƠN CHỜ XỬ LÝ</div>
        <div class="stat-num text-pending">{{ data.pendingOrders }}</div>
        <div class="stat-meta">Cần xác nhận / xuất kho</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">KHÁCH HÀNG</div>
        <div class="stat-num">{{ data.totalCustomers }}</div>
        <div class="stat-meta">Khách hàng thành viên</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">NHÂN SỰ VẬN HÀNH</div>
        <div class="stat-num">{{ data.totalEmployees }}</div>
        <div class="stat-meta">Nhân viên & Quản lý</div>
      </div>
    </div>

    <!-- Charts & Analytics Section -->
    <el-row :gutter="20">
      <!-- Revenue Bar Chart -->
      <el-col :xs="24" :lg="15">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">BIỂU ĐỒ DOANH THU ({{ chartModeLabel }})</h3>
              <p class="chart-sub">Thống kê doanh số thực tế từ các đơn hàng thành công</p>
            </div>
            <div class="mode-tabs">
              <button
                class="mode-btn"
                :class="{ active: chartMode === 'DAY' }"
                @click="chartMode = 'DAY'"
              >
                THEO NGÀY
              </button>
              <button
                class="mode-btn"
                :class="{ active: chartMode === 'MONTH' }"
                @click="chartMode = 'MONTH'"
              >
                THEO THÁNG
              </button>
              <button
                class="mode-btn"
                :class="{ active: chartMode === 'YEAR' }"
                @click="chartMode = 'YEAR'"
              >
                THEO NĂM
              </button>
            </div>
          </div>

          <div v-if="activeRevenueSeries.length === 0" class="empty-box">
            <el-empty description="Chưa có dữ liệu doanh thu" :image-size="70" />
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
              <div class="bar-sub">{{ item.orderCount }} đơn</div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Order Status Breakdown -->
      <el-col :xs="24" :lg="9">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">TRẠNG THÁI ĐƠN HÀNG</h3>
              <p class="chart-sub">Tỷ lệ phân bổ theo chu trình xử lý đơn</p>
            </div>
          </div>

          <div v-if="data.orderStatusCounts.length === 0" class="empty-box">
            <el-empty description="Chưa có dữ liệu đơn hàng" :image-size="70" />
          </div>
          <div v-else class="status-bars">
            <div
              v-for="s in data.orderStatusCounts"
              :key="s.status"
              class="status-row"
            >
              <div class="status-info">
                <span class="status-name">{{ s.status }}</span>
                <span class="status-count">
                  <strong>{{ s.count }}</strong> đơn ({{ calcStatusPercent(s.count) }}%)
                </span>
              </div>
              <div class="status-progress-track">
                <div
                  class="status-progress-fill"
                  :style="{
                    width: calcStatusPercent(s.count) + '%',
                    backgroundColor: statusColor(s.status)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Top Selling Sneakers -->
    <div class="table-card" style="margin-top: 4px;">
      <div class="section-head">
        <div>
          <h3 class="section-title">TOP SẢN PHẨM BÁN CHẠY NHẤT</h3>
          <p class="section-sub">Xếp hạng theo số lượng đôi giày bán ra thực tế</p>
        </div>
        <el-button size="small" @click="$router.push('/admin/reports')">XEM BÁO CÁO CHI TIẾT →</el-button>
      </div>

      <el-table :data="data.topSellingProducts" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="productCode" label="Mã SKU" width="110">
          <template #default="{ row }">
            <span class="code-badge">{{ row.productCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="Tên sản phẩm Sneaker" min-width="200">
          <template #default="{ row }">
            <span class="product-link" @click="$router.push('/admin/products')">{{ row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantitySold" label="Số lượng bán" width="130" align="right">
          <template #default="{ row }">
            <strong>{{ row.quantitySold }}</strong> đôi
          </template>
        </el-table-column>
        <el-table-column prop="totalRevenue" label="Doanh thu mang lại" width="180" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ formatCurrency(row.totalRevenue) }}</span>
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

const loading = ref(false)
const chartMode = ref('DAY')

const data = ref({
  totalProducts: 0,
  activeProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalCustomers: 0,
  totalEmployees: 0,
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
  return Math.max(pct, 8)
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
      return '#10b981'
    case 'CONFIRMED':
      return '#000000'
    case 'CANCELLED':
      return '#ef4444'
    default:
      return '#71717a'
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
.header-actions-group {
  display: flex;
  gap: 10px;

  .btn-refresh {
    font-size: 11px;
    font-weight: 800;
    border-radius: 0;
  }

  .btn-primary-header {
    display: inline-flex;
    align-items: center;
    background: #000000;
    color: #ffffff;
    border: 1px solid #000000;
    padding: 0 16px;
    border-radius: 0;
    font-family: inherit;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #262626;
    }
  }
}

/* Revenue KPI Row */
.revenue-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;

  .rev-card {
    padding: 24px;
    border-radius: 0;
    display: flex;
    flex-direction: column;

    &.card-primary-dark {
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;

      .rev-eyebrow {
        color: #a3a3a3;
      }
      .rev-sub {
        color: #737373;
      }
    }

    &.card-white {
      background: #ffffff;
      color: #000000;
      border: 1px solid #e5e5e5;

      .rev-eyebrow {
        color: #737373;
      }
      .rev-sub {
        color: #737373;
      }
    }

    .rev-eyebrow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      .live-dot-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.1em;
        background: #171717;
        color: #10b981;
        padding: 2px 6px;
        border-radius: 0;

        .dot {
          width: 5px;
          height: 5px;
          background: #10b981;
        }
      }

      .period-tag {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.08em;
        background: #f5f5f5;
        color: #525252;
        padding: 2px 6px;
        border-radius: 0;
      }
    }

    .rev-value {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 12px 0 6px;
      font-variant-numeric: tabular-nums;
    }

    .rev-sub {
      font-size: 12px;
      line-height: 1.4;
    }
  }
}

/* Stat Grid */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;

  .stat-card {
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 0;
    padding: 16px 18px;

    .stat-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #737373;
      text-transform: uppercase;
    }

    .stat-num {
      font-size: 24px;
      font-weight: 900;
      color: #000000;
      margin: 6px 0 2px;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;

      &.text-active {
        color: #10b981;
      }
      &.text-pending {
        color: #f59e0b;
      }
    }

    .stat-meta {
      font-size: 11px;
      color: #a3a3a3;
    }
  }
}

/* Chart Card */
.chart-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .chart-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #000000;
      margin: 0;
    }

    .chart-sub {
      font-size: 12px;
      color: #737373;
      margin: 4px 0 0;
    }

    .mode-tabs {
      display: flex;
      background: #f5f5f5;
      padding: 2px;
      border-radius: 0;
      border: 1px solid #e5e5e5;

      .mode-btn {
        padding: 5px 12px;
        background: none;
        border: none;
        font-family: inherit;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #737373;
        cursor: pointer;
        border-radius: 0;
        transition: all 0.15s ease;

        &.active {
          background: #000000;
          color: #ffffff;
        }
      }
    }
  }
}

.bar-chart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 20px 8px 6px;
  overflow-x: auto;
  min-height: 220px;

  .bar-column {
    flex: 1;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .bar-value {
      font-size: 11px;
      font-weight: 900;
      color: #000000;
      margin-bottom: 8px;
      font-variant-numeric: tabular-nums;
    }

    .bar-track {
      width: 36px;
      height: 160px;
      background: #f5f5f5;
      border-radius: 0;
      display: flex;
      align-items: flex-end;
      overflow: hidden;

      .bar-fill {
        width: 100%;
        background: #000000;
        border-radius: 0;
        transition: height 0.3s ease;

        &:hover {
          background: #262626;
        }
      }
    }

    .bar-label {
      margin-top: 10px;
      font-size: 11px;
      font-weight: 800;
      color: #000000;
    }

    .bar-sub {
      font-size: 10px;
      color: #737373;
      margin-top: 2px;
    }
  }
}

/* Status Bars */
.status-bars {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 10px;

  .status-row {
    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;

      .status-name {
        font-weight: 800;
        color: #000000;
      }

      .status-count {
        color: #737373;
        strong {
          color: #000000;
        }
      }
    }

    .status-progress-track {
      height: 8px;
      background: #f5f5f5;
      border-radius: 0;
      overflow: hidden;

      .status-progress-fill {
        height: 100%;
        border-radius: 0;
        transition: width 0.3s ease;
      }
    }
  }
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #000000;
    text-transform: uppercase;
    margin: 0;
  }

  .section-sub {
    font-size: 12px;
    color: #737373;
    margin: 3px 0 0;
  }
}

.product-link {
  font-weight: 800;
  color: #000000;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}

.empty-box {
  padding: 40px 0;
}
</style>
