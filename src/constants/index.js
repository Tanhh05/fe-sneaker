export const ORDER_STATUS_MAP = {
  DRAFT: { label: 'Nháp (DRAFT)', type: 'info' },
  CONFIRMED: { label: 'Đã xác nhận', type: 'warning' },
  COMPLETED: { label: 'Hoàn thành', type: 'success' },
  CANCELLED: { label: 'Đã hủy', type: 'danger' }
}

export const PURCHASE_STATUS_MAP = {
  DRAFT: { label: 'Nháp (DRAFT)', type: 'info' },
  CONFIRMED: { label: 'Đã xác nhận nhập', type: 'success' },
  CANCELLED: { label: 'Đã hủy', type: 'danger' }
}

export const PAYMENT_METHOD_MAP = {
  CASH: 'Tiền mặt tại quầy',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng'
}

export const ROLE_MAP = {
  ADMIN: { label: 'ADMIN (Quản trị viên)', type: 'danger' },
  MANAGER: { label: 'MANAGER (Quản lý)', type: 'warning' },
  STAFF: { label: 'STAFF (Nhân viên bán hàng)', type: 'primary' }
}

