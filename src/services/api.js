import axios from 'axios'
import { ElMessage } from 'element-plus'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sneaker_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.message || 'Có lỗi xảy ra từ máy chủ'
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('sneaker_token')
        localStorage.removeItem('sneaker_user')
        ElMessage.error(msg)
        window.location.href = '/login'
      } else {
        ElMessage.error(msg)
      }
    } else {
      ElMessage.error('Không thể kết nối đến máy chủ Backend')
    }
    return Promise.reject(error)
  }
)

export default apiClient

