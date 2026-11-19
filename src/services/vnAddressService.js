import axios from 'axios'

const API_BASE = 'https://provinces.open-api.vn/api/v1'

// Fallback data in case client network cannot reach external API
const FALLBACK_PROVINCES = [
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 74, name: 'Tỉnh Bình Dương' },
  { code: 75, name: 'Tỉnh Đồng Nai' },
  { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { code: 46, name: 'Tỉnh Thừa Thiên Huế' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 37, name: 'Tỉnh Ninh Bình' },
  { code: 27, name: 'Tỉnh Bắc Ninh' },
  { code: 30, name: 'Tỉnh Hải Dương' },
  { code: 35, name: 'Tỉnh Hà Nam' },
  { code: 36, name: 'Tỉnh Nam Định' },
  { code: 34, name: 'Tỉnh Thái Bình' },
  { code: 38, name: 'Tỉnh Thanh Hóa' },
  { code: 40, name: 'Tỉnh Nghệ An' },
  { code: 42, name: 'Tỉnh Hà Tĩnh' },
  { code: 44, name: 'Tỉnh Quảng Bình' },
  { code: 45, name: 'Tỉnh Quảng Trị' },
  { code: 49, name: 'Tỉnh Quảng Nam' },
  { code: 51, name: 'Tỉnh Quảng Ngãi' },
  { code: 52, name: 'Tỉnh Bình Định' },
  { code: 54, name: 'Tỉnh Phú Yên' },
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 60, name: 'Tỉnh Đắk Lắk' },
  { code: 70, name: 'Tỉnh Bình Phước' },
  { code: 72, name: 'Tỉnh Tây Ninh' },
  { code: 80, name: 'Tỉnh Long An' },
  { code: 82, name: 'Tỉnh Tiền Giang' },
  { code: 83, name: 'Tỉnh Bến Tre' },
  { code: 84, name: 'Tỉnh Trà Vinh' },
  { code: 86, name: 'Tỉnh Vĩnh Long' },
  { code: 87, name: 'Tỉnh Đồng Tháp' },
  { code: 89, name: 'Tỉnh An Giang' },
  { code: 91, name: 'Tỉnh Kiên Giang' },
  { code: 93, name: 'Tỉnh Hậu Giang' },
  { code: 94, name: 'Tỉnh Sóc Trăng' },
  { code: 95, name: 'Tỉnh Bạc Liêu' },
  { code: 96, name: 'Tỉnh Cà Mau' }
]

export const vnAddressService = {
  /**
   * Lấy danh sách 63 Tỉnh/Thành phố Việt Nam
   */
  async getProvinces() {
    try {
      const res = await axios.get(`${API_BASE}/p/`, { timeout: 8000 })
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(p => ({
          code: p.code,
          name: p.name,
          divisionType: p.division_type
        }))
      }
      return FALLBACK_PROVINCES
    } catch (err) {
      console.warn('Không thể kết nối provinces API, sử dụng dữ liệu dự phòng:', err.message)
      return FALLBACK_PROVINCES
    }
  },

  /**
   * Lấy danh sách Quận/Huyện theo mã Tỉnh/Thành phố
   * @param {number|string} provinceCode
   */
  async getDistricts(provinceCode) {
    if (!provinceCode) return []
    try {
      const res = await axios.get(`${API_BASE}/p/${provinceCode}?depth=2`, { timeout: 8000 })
      const districts = res.data?.districts || []
      return districts.map(d => ({
        code: d.code,
        name: d.name,
        divisionType: d.division_type
      }))
    } catch (err) {
      console.error('Lỗi tải danh sách Quận/Huyện:', err)
      return []
    }
  },

  /**
   * Lấy danh sách Phường/Xã theo mã Quận/Huyện
   * @param {number|string} districtCode
   */
  async getWards(districtCode) {
    if (!districtCode) return []
    try {
      const res = await axios.get(`${API_BASE}/d/${districtCode}?depth=2`, { timeout: 8000 })
      const wards = res.data?.wards || []
      return wards.map(w => ({
        code: w.code,
        name: w.name,
        divisionType: w.division_type
      }))
    } catch (err) {
      console.error('Lỗi tải danh sách Phường/Xã:', err)
      return []
    }
  }
}

export default vnAddressService
