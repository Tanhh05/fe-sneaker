export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(value))
}

export function formatDateTime(value) {
  if (!value) return '---'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(value) {
  if (!value) return '---'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

