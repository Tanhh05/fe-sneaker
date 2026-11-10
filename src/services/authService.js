import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },
  logout() {
    return api.post('/auth/logout')
  },
  changePassword(payload) {
    return api.post('/auth/change-password', payload)
  },
  getCurrentUser() {
    return api.get('/auth/me')
  }
}

