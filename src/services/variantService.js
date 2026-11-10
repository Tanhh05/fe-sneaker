import api from './api'

export const variantService = {
  getVariants(params) {
    return api.get('/variants', { params })
  },
  getAllVariants() {
    return api.get('/variants/all')
  },
  getVariantsByProduct(productId) {
    return api.get(`/variants/by-product/${productId}`)
  },
  createVariant(payload) {
    return api.post('/variants', payload)
  },
  updateVariant(id, payload) {
    return api.put(`/variants/${id}`, payload)
  },
  getSizes() {
    return api.get('/sizes')
  },
  createSize(payload) {
    return api.post('/sizes', payload)
  },
  updateSize(id, payload) {
    return api.put(`/sizes/${id}`, payload)
  },
  getColors() {
    return api.get('/colors')
  },
  createColor(payload) {
    return api.post('/colors', payload)
  },
  updateColor(id, payload) {
    return api.put(`/colors/${id}`, payload)
  }
}

