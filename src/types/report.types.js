/**
 * @typedef {Object} ComprehensiveReportFilter
 * @property {string} groupBy
 * @property {string|null} fromDate
 * @property {string|null} toDate
 * @property {number|null} brandId
 * @property {number|null} categoryId
 */
export const DEFAULT_REPORT_FILTER = {
  groupBy: 'DAY',
  fromDate: null,
  toDate: null,
  brandId: null,
  categoryId: null
}
