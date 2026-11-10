/**
 * @typedef {Object} PurchaseOrderDto
 * @property {number} id
 * @property {string} purchaseCode
 * @property {number} supplierId
 * @property {string} supplierName
 * @property {number} totalAmount
 * @property {string} status
 */
export const DEFAULT_PURCHASE_FILTER = {
  keyword: '',
  supplierId: null,
  status: ''
}
