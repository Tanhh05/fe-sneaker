import api from './api'

export const customerService = {
  getCustomers(params) {
    return api.get('/customers', { params })
  },
  getAllCustomers() {
    return api.get('/customers/all')
  },
  createCustomer(payload) {
    return api.post('/customers', payload)
  },
  updateCustomer(id, payload) {
    return api.put(`/customers/${id}`, payload)
  }
}

