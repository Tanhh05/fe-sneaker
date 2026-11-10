import api from './api'

export const brandService = {
  getBrands(params) {
    return api.get('/brands', { params })
  },
  getAllBrands() {
    return api.get('/brands/all')
  },
  createBrand(payload) {
    return api.post('/brands', payload)
  },
  updateBrand(id, payload) {
    return api.put(`/brands/${id}`, payload)
  },
  deactivateBrand(id) {
    return api.delete(`/brands/${id}`)
  }
}

