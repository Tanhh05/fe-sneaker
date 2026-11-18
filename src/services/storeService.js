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
  getProductDetail(id) {
    return api.get(`/store/products/${id}`)
  },
  checkout(orderData) {
    return api.post('/store/checkout', orderData)
  },
  trackOrder(code, phone) {
    return api.get('/store/orders/track', { params: { code, phone } })
  }
}

export default storeService
