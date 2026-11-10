import api from './api'

export const productService = {
  getProducts(params) {
    return api.get('/products', { params })
  },
  getAllProducts() {
    return api.get('/products/all')
  },
  getProductById(id) {
    return api.get(`/products/${id}`)
  },
  createProduct(payload) {
    return api.post('/products', payload)
  },
  updateProduct(id, payload) {
    return api.put(`/products/${id}`, payload)
  },
  discontinueProduct(id) {
    return api.delete(`/products/${id}`)
  }
}

