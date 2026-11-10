/**
 * @typedef {Object} CustomerDto
 * @property {number} id
 * @property {string} customerCode
 * @property {string} fullName
 * @property {string} phone
 * @property {string} email
 * @property {string} status
 */
export const DEFAULT_CUSTOMER_FORM = {
  customerCode: '',
  fullName: '',
  phone: '',
  email: '',
  gender: 'MALE',
  dateOfBirth: null,
  address: '',
  status: 'ACTIVE'
}
