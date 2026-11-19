import apiClient from './api'

export const fileService = {
  /**
   * Upload an image file from user device to MinIO
   * @param {File} file
   * @returns {Promise<{url: string, fileName: string, size: number, originalName: string}>}
   */
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  }
}
