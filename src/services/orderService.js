import api from './api'

export const orderService = {
  createSaleOrder(payload) {
    return api.post('/sales', payload)
  },
  getOrders(params) {
    return api.get('/orders', { params })
  },
  getOrderById(id) {
    return api.get(`/orders/${id}`)
  },
  getOrdersByCustomer(customerId) {
    return api.get(`/orders/by-customer/${customerId}`)
  },
  updateOrderStatus(id, payload) {
    return api.patch(`/orders/${id}/status`, payload)
  }
}

