import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },
  register(payload) {
    return api.post('/auth/register', payload)
  },
  loginWithGoogle(payload) {
    return api.post('/auth/google', payload)
  },
  logout() {
    return api.post('/auth/logout')
  },
  changePassword(payload) {
    return api.post('/auth/change-password', payload)
  },
  getCurrentUser() {
    return api.get('/auth/me')
  },
  updateProfile(payload) {
    return api.put('/auth/profile', payload)
  }
}

