import { ref, reactive } from 'vue'
import { useDebouncedWatch } from './useDebounce'

/**
 * Custom Composable quản lý luồng dữ liệu chuẩn cho màn hình danh sách (Feature-Based Architecture):
 * - Quản lý đầy đủ các trạng thái: loading, error, items (Server State)
 * - Quản lý phân trang (pagination: page, size, total)
 * - Quản lý bộ lọc (filters) kèm tự động Debounce 350ms khi gõ keyword
 *
 * @param {Function} fetchApiFn Hàm gọi API nhận params phân trang & bộ lọc
 * @param {Object} initialFilters Giá trị khởi tạo của bộ lọc
 * @param {number} debounceMs Độ trễ tìm kiếm (mặc định 350ms)
 */
export function usePaginatedFeature(fetchApiFn, initialFilters = { keyword: '', status: '' }, debounceMs = 350) {
  const loading = ref(false)
  const error = ref(null)
  const items = ref([])

  const filters = reactive({ ...initialFilters })
  const pagination = reactive({
    page: 1,
    size: 10,
    total: 0
  })

  async function loadData() {
    loading.value = true
    error.value = null
    try {
      const params = {
        ...filters,
        page: pagination.page - 1,
        size: pagination.size
      }
      const res = await fetchApiFn(params)
      items.value = res.data?.content || []
      pagination.total = res.data?.totalElements || 0
    } catch (err) {
      error.value = err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu'
    } finally {
      loading.value = false
    }
  }

  function resetFilter() {
    Object.keys(initialFilters).forEach((key) => {
      filters[key] = initialFilters[key]
    })
    pagination.page = 1
    loadData()
  }

  if ('keyword' in filters) {
    useDebouncedWatch(
      () => filters.keyword,
      () => {
        pagination.page = 1
        loadData()
      },
      debounceMs
    )
  }

  return {
    loading,
    error,
    items,
    filters,
    pagination,
    loadData,
    resetFilter
  }
}

