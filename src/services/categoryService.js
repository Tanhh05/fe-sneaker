import api from './api'

export const categoryService = {
  getCategories(params) {
    return api.get('/categories', { params })
  },
  getAllCategories() {
    return api.get('/categories/all')
  },
  createCategory(payload) {
    return api.post('/categories', payload)
  },
  updateCategory(id, payload) {
    return api.put(`/categories/${id}`, payload)
  },
  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  }
}

