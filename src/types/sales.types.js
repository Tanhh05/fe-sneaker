/**
 * @typedef {Object} PosCartItem
 * @property {Object} variant
 * @property {number} quantity
 */
export const DEFAULT_CHECKOUT_FORM = {
  customerId: null,
  paymentMethod: 'CASH',
  status: 'COMPLETED',
  paymentReference: '',
  note: ''
}
