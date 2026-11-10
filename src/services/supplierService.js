import api from './api'

export const supplierService = {
  getSuppliers(params) {
    return api.get('/suppliers', { params })
  },
  getAllSuppliers() {
    return api.get('/suppliers/all')
  },
  createSupplier(payload) {
    return api.post('/suppliers', payload)
  },
  updateSupplier(id, payload) {
    return api.put(`/suppliers/${id}`, payload)
  },
  deactivateSupplier(id) {
    return api.delete(`/suppliers/${id}`)
  }
}

