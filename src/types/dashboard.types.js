/**
 * @typedef {Object} DashboardResponse
 * @property {number} totalProducts
 * @property {number} activeProducts
 * @property {number} totalCustomers
 * @property {number} totalEmployees
 * @property {number} totalOrders
 * @property {number} pendingOrders
 * @property {number} todayRevenue
 * @property {number} monthRevenue
 * @property {number} totalRevenue
 */
export const DEFAULT_DASHBOARD_STATE = {
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
}
