/**
 * @typedef {Object} SupplierDto
 * @property {number} id
 * @property {string} supplierCode
 * @property {string} supplierName
 * @property {string} contactPerson
 * @property {string} phone
 * @property {string} email
 * @property {string} taxCode
 * @property {string} status
 */
export const DEFAULT_SUPPLIER_FORM = {
  supplierCode: '',
  supplierName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  status: 'ACTIVE'
}
