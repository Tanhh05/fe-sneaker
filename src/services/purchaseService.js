import api from './api'

export const purchaseService = {
  getPurchases(params) {
    return api.get('/purchases', { params })
  },
  getPurchaseById(id) {
    return api.get(`/purchases/${id}`)
  },
  createPurchase(payload) {
    return api.post('/purchases', payload)
  },
  updatePurchase(id, payload) {
    return api.put(`/purchases/${id}`, payload)
  },
  confirmPurchase(id) {
    return api.post(`/purchases/${id}/confirm`)
  },
  cancelPurchase(id) {
    return api.post(`/purchases/${id}/cancel`)
  }
}

