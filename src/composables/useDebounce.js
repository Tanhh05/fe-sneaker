import { onBeforeUnmount, watch } from 'vue'

/**
 * Custom composable tạo hàm Debounce (mặc định 350ms) để tối ưu gọi API khi gõ tìm kiếm
 * @param {Function} fn Hàm cần trì hoãn thực thi
 * @param {number} delay Độ trễ tính bằng ms (300ms - 500ms)
 */
export function useDebounceFn(fn, delay = 350) {
  let timer = null

  const debounced = (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onBeforeUnmount(() => {
    debounced.cancel()
  })

  return debounced
}

/**
 * Tự động theo dõi giá trị tìm kiếm (keyword) với cơ chế Debounce 350ms
 * @param {Function|import('vue').Ref} source Nguồn dữ liệu cần watch (ví dụ: () => filters.keyword)
 * @param {Function} callback Hàm thực thi sau khi người dùng ngừng gõ (ví dụ: () => { pagination.page = 1; loadData() })
 * @param {number} delay Độ trễ tính bằng ms (mặc định 350ms)
 */
export function useDebouncedWatch(source, callback, delay = 350) {
  const debouncedCallback = useDebounceFn(callback, delay)
  watch(source, () => {
    debouncedCallback()
  })
  return debouncedCallback
}

