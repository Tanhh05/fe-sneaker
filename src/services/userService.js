import api from './api'

export const userService = {
  getUsers(params) {
    return api.get('/users', { params })
  },
  getAllUsers() {
    return api.get('/users/all')
  },
  getRoles() {
    return api.get('/users/roles')
  },
  createUser(payload) {
    return api.post('/users', payload)
  },
  updateUser(id, payload) {
    return api.put(`/users/${id}`, payload)
  },
  updateUserStatus(id, status) {
    return api.patch(`/users/${id}/status`, { status })
  }
}

