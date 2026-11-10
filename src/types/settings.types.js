/**
 * @typedef {Object} UserDto
 * @property {number} id
 * @property {string} username
 * @property {string} fullName
 * @property {string} email
 * @property {string} status
 * @property {string[]} roles
 */
export const DEFAULT_USER_FORM = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
  roles: ['STAFF']
}
