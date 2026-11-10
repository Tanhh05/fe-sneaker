<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <div class="page-title-group">
        <h2 class="page-title">Báo Cáo &amp; Thống Kê Đa Chiều</h2>
        <p class="page-subtitle">Phân tích doanh thu (chỉ tính đơn hoàn thành), sản phẩm bán chạy/chậm, nhập hàng, khách hàng và hiệu suất nhân viên</p>
      </div>
      <el-button type="success" :loading="exporting" @click="exportExcel">
        <el-icon style="margin-right: 6px"><Download /></el-icon> Xuất Báo Cáo Excel (.xlsx)
      </el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-card">
      <el-row :gutter="12">
        <el-col :xs="12" :sm="5" :md="4">
          <el-select v-model="filters.groupBy" style="width: 100%" @change="loadReport">
            <el-option label="Theo Ngày (DAY)" value="DAY" />
            <el-option label="Theo Tháng (MONTH)" value="MONTH" />
            <el-option label="Theo Năm (YEAR)" value="YEAR" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-date-picker
            v-model="filters.fromDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Từ ngày"
            style="width: 100%"
            @change="loadReport"
          />
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-date-picker
            v-model="filters.toDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Đến ngày"
            style="width: 100%"
            @change="loadReport"
          />
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-select v-model="filters.brandId" placeholder="Lọc Thương hiệu" clearable style="width: 100%" @change="loadReport">
            <el-option v-for="b in brands" :key="b.id" :label="b.brandName" :value="b.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="5" :md="4">
          <el-select v-model="filters.categoryId" placeholder="Lọc Danh mục" clearable style="width: 100%" @change="loadReport">
            <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="24" :md="4">
          <el-button type="primary" @click="loadReport">Tổng hợp</el-button>
          <el-button @click="resetFilters">Xóa lọc</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Summary KPI Cards -->
    <div class="report-kpis">
      <div class="kpi-box">
        <div class="kpi-label">Doanh thu hoàn thành (Kỳ lọc)</div>
        <div class="kpi-val price-text">{{ formatCurrency(report.totalRevenue) }}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Số đơn hàng hoàn thành</div>
        <div class="kpi-val">{{ report.totalCompletedOrders }} đơn</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Tổng số lượng giày đã bán</div>
        <div class="kpi-val text-green">{{ report.totalQuantitySold }} đôi</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Tổng giá trị nhập hàng (Xác nhận)</div>
        <div class="kpi-val">{{ formatCurrency(report.totalPurchaseAmount) }}</div>
      </div>
    </div>

    <!-- Multi-tab Detailed Reports -->
    <div class="table-card">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: Revenue by Day / Month / Year -->
        <el-tab-pane label="1. Doanh thu theo Ngày / Tháng / Năm" name="revenue">
          <el-table :data="report.revenueSeries || []" stripe border style="width: 100%">
            <el-table-column prop="period" label="Kỳ báo cáo (Ngày / Tháng / Năm)" width="240">
              <template #default="{ row }">
                <span class="code-badge">{{ row.period }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="Số đơn hoàn thành" width="180" align="center" />
            <el-table-column prop="quantitySold" label="Số lượng sản phẩm đã bán" width="210" align="center">
              <template #default="{ row }"><strong>{{ row.quantitySold }}</strong> đôi</template>
            </el-table-column>
            <el-table-column label="Doanh thu (Chỉ tính đơn COMPLETED)" min-width="220" align="right">
              <template #default="{ row }">
                <span class="price-text">{{ formatCurrency(row.revenue) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 2: Top Selling & Slow Selling Products -->
        <el-tab-pane label="2. Sản phẩm Bán chạy &amp; Bán chậm" name="products">
          <el-row :gutter="18">
            <el-col :xs="24" :lg="12">
              <h4 style="margin-bottom: 10px; color: #16a34a">Top Sản phẩm Bán chạy nhất</h4>
              <el-table :data="report.topSellingProducts || []" stripe border size="small">
                <el-table-column prop="productCode" label="Mã SP" width="90" />
                <el-table-column prop="productName" label="Tên sản phẩm" min-width="160" />
                <el-table-column prop="brandName" label="Hãng" width="95" />
                <el-table-column prop="quantitySold" label="Đã bán" width="85" align="center" />
                <el-table-column label="Doanh thu" width="135" align="right">
                  <template #default="{ row }">
                    <strong class="price-text">{{ formatCurrency(row.revenue) }}</strong>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :lg="12">
              <h4 style="margin-bottom: 10px; color: #ea580c">Danh sách Sản phẩm Bán chậm</h4>
              <el-table :data="report.slowSellingProducts || []" stripe border size="small">
                <el-table-column prop="productCode" label="Mã SP" width="90" />
                <el-table-column prop="productName" label="Tên sản phẩm" min-width="160" />
                <el-table-column prop="brandName" label="Hãng" width="95" />
                <el-table-column prop="quantitySold" label="Đã bán" width="85" align="center" />
                <el-table-column label="Doanh thu" width="135" align="right">
                  <template #default="{ row }">
                    <span>{{ formatCurrency(row.revenue) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 3: Revenue by Employee -->
        <el-tab-pane label="3. Doanh thu theo Nhân viên" name="employees">
          <el-table :data="report.employeeRevenueStats || []" stripe border style="width: 100%">
            <el-table-column prop="employeeCode" label="Mã nhân viên" width="140">
              <template #default="{ row }">
                <span class="code-badge">{{ row.employeeCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="employeeName" label="Họ và tên nhân viên" min-width="220" />
            <el-table-column prop="completedOrderCount" label="Số đơn hoàn thành" width="180" align="center" />
            <el-table-column label="Tổng doanh thu mang lại" width="220" align="right">
              <template #default="{ row }">
                <strong class="price-text">{{ formatCurrency(row.totalRevenue) }}</strong>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 4: Customer & Order Status Stats -->
        <el-tab-pane label="4. Thống kê Khách hàng &amp; Trạng thái Đơn" name="customers">
          <el-row :gutter="18">
            <el-col :xs="24" :lg="14">
              <h4 style="margin-bottom: 10px">Thống kê Chi tiêu Khách hàng</h4>
              <el-table :data="report.customerStats || []" stripe border size="small">
                <el-table-column prop="customerCode" label="Mã KH" width="95" />
                <el-table-column prop="customerName" label="Họ tên khách hàng" min-width="160" />
                <el-table-column prop="phone" label="SĐT" width="120" />
                <el-table-column prop="completedOrderCount" label="Số đơn mua" width="100" align="center" />
                <el-table-column label="Tổng chi tiêu" width="145" align="right">
                  <template #default="{ row }">
                    <strong class="price-text">{{ formatCurrency(row.totalSpent) }}</strong>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :lg="10">
              <h4 style="margin-bottom: 10px">Thống kê Đơn hàng theo Trạng thái</h4>
              <el-table :data="report.orderStatusStats || []" stripe border size="small">
                <el-table-column label="Trạng thái" width="160">
                  <template #default="{ row }">
                    <el-tag :type="ORDER_STATUS_MAP[row.status]?.type || 'info'" size="small">
                      {{ ORDER_STATUS_MAP[row.status]?.label || row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="Số lượng đơn" width="110" align="center" />
                <el-table-column label="Tổng giá trị" min-width="140" align="right">
                  <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- Tab 5: Purchase Import Stats -->
        <el-tab-pane label="5. Thống kê Nhập hàng theo Nhà cung cấp" name="purchases">
          <el-table :data="report.purchaseStats || []" stripe border style="width: 100%">
            <el-table-column prop="supplierCode" label="Mã NCC" width="130">
              <template #default="{ row }">
                <span class="code-badge">{{ row.supplierCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="supplierName" label="Tên Nhà cung cấp" min-width="250" />
            <el-table-column prop="confirmedCount" label="Số phiếu nhập xác nhận" width="180" align="center" />
            <el-table-column prop="totalItemsImported" label="Tổng số đôi đã nhập" width="170" align="center" />
            <el-table-column label="Tổng giá trị nhập hàng" width="210" align="right">
              <template #default="{ row }">
                <strong class="price-text">{{ formatCurrency(row.totalAmount) }}</strong>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { reportService } from '@/services/reportService'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { formatCurrency } from '@/utils/formatters'
import { ORDER_STATUS_MAP } from '@/constants'

const loading = ref(false)
const exporting = ref(false)
const activeTab = ref('revenue')

const brands = ref([])
const categories = ref([])

const filters = reactive({
  groupBy: 'DAY',
  fromDate: null,
  toDate: null,
  brandId: null,
  categoryId: null
})

const report = ref({
  totalRevenue: 0,
  totalCompletedOrders: 0,
  totalQuantitySold: 0,
  totalPurchaseAmount: 0,
  totalConfirmedPurchases: 0,
  revenueSeries: [],
  topSellingProducts: [],
  slowSellingProducts: [],
  orderStatusStats: [],
  employeeRevenueStats: [],
  customerStats: [],
  purchaseStats: []
})

async function loadMeta() {
  const [bRes, cRes] = await Promise.all([
    brandService.getAllBrands(),
    categoryService.getAllCategories()
  ])
  brands.value = bRes.data || []
  categories.value = cRes.data || []
}

async function loadReport() {
  loading.value = true
  try {
    const res = await reportService.getSummaryReport({
      groupBy: filters.groupBy,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined
    })
    report.value = res.data || report.value
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.groupBy = 'DAY'
  filters.fromDate = null
  filters.toDate = null
  filters.brandId = null
  filters.categoryId = null
  loadReport()
}

async function exportExcel() {
  exporting.value = true
  try {
    const blobData = await reportService.exportReportExcel({
      groupBy: filters.groupBy,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined
    })
    const url = window.URL.createObjectURL(new Blob([blobData]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `BaoCao_SneakerStore_${filters.groupBy}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    ElMessage.success('Đã xuất file Excel thành công!')
  } catch (_) {
    ElMessage.error('Không thể xuất file Excel')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadMeta()
  loadReport()
})
</script>

<style scoped lang="scss">
.report-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;

  .kpi-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 20px;

    .kpi-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #64748b;
    }
    .kpi-val {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 6px;
      &.text-green {
        color: #16a34a;
      }
    }
  }
}
</style>
