import api from './api'

export const storeService = {
  getBrands() {
    return api.get('/store/brands')
  },
  getCategories() {
    return api.get('/store/categories')
  },
  getProducts(params) {
    return api.get('/store/products', { params })
  },
  getFeaturedProducts() {
    return api.get('/store/products/featured')
  },
  getBestSellerProduct() {
    return api.get('/store/products/best-seller')
  },
  getProductDetail(id) {
    return api.get(`/store/products/${id}`)
  },
  checkout(orderData) {
    return api.post('/store/checkout', orderData)
  },
  trackOrder(code, phone) {
    return api.get('/store/orders/track', { params: { code, phone } })
  },
  getMyOrders(params = {}) {
    return api.get('/store/my-orders', { params })
  },
  getMyOrderDetail(orderCode, phone) {
    return api.get(`/store/my-orders/${orderCode}`, { params: { phone } })
  },
  cancelMyOrder(orderCode, payload = {}) {
    return api.post(`/store/my-orders/${orderCode}/cancel`, payload)
  },
  getProductReviews(productId) {
    return api.get(`/store/products/${productId}/reviews`)
  },
  submitProductReview(productId, data) {
    return api.post(`/store/products/${productId}/reviews`, data)
  }
}

export default storeService
