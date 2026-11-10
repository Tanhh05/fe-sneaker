/**
 * @typedef {Object} LoginRequest
 * @property {string} username
 * @property {string} password
 *
 * @typedef {Object} AuthUserResponse
 * @property {string} accessToken
 * @property {string} tokenType
 * @property {number} userId
 * @property {string} username
 * @property {string} fullName
 * @property {string[]} roles
 */
export const DEFAULT_LOGIN_FORM = {
  username: '',
  password: ''
}
