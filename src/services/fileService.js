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
  },

  /**
   * Upload multiple image files from user device to MinIO
   * @param {File[]|FileList} files
   * @returns {Promise<Array<{url: string, fileName: string, originalName: string}>>}
   */
  async uploadImages(files) {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    const res = await apiClient.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  }
}
