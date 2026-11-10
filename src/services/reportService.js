import api from './api'

export const reportService = {
  getDashboard() {
    return api.get('/reports/dashboard')
  },
  getSummaryReport(params) {
    return api.get('/reports/summary', { params })
  },
  exportReportExcel(params) {
    return api.get('/reports/export-excel', {
      params,
      responseType: 'blob'
    })
  }
}

