/**
 * @typedef {Object} SalesOrderDto
 * @property {number} id
 * @property {string} orderCode
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {number} finalAmount
 * @property {string} paymentMethod
 * @property {string} status
 */
export const DEFAULT_ORDER_FILTER = {
  keyword: '',
  status: '',
  fromDate: null,
  toDate: null
}
