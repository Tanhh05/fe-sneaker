import {
  Odometer,
  ShoppingCart,
  Tickets,
  Goods,
  SetUp,
  CollectionTag,
  Menu,
  Van,
  Box,
  User,
  Avatar,
  DataAnalysis,
  Lock
} from '@element-plus/icons-vue'

export const MENU_GROUPS = [
  {
    groupTitle: 'TỔNG QUAN & BÁN HÀNG',
    items: [
      { path: '/dashboard', title: 'Dashboard Tổng quan', icon: Odometer, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/sales', title: 'Bán hàng tại quầy (POS)', icon: ShoppingCart, badge: 'POS', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/orders', title: 'Quản lý đơn hàng', icon: Tickets, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'SẢN PHẨM & BIẾN THỂ',
    items: [
      { path: '/products', title: 'Quản lý sản phẩm', icon: Goods, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/variants', title: 'Biến thể SKU & Size/Màu', icon: SetUp, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/categories', title: 'Danh mục giày', icon: Menu, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/brands', title: 'Thương hiệu Sneaker', icon: CollectionTag, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'NHẬP HÀNG & ĐỐI TÁC',
    items: [
      { path: '/purchases', title: 'Quản lý nhập hàng', icon: Box, roles: ['ADMIN', 'MANAGER'] },
      { path: '/suppliers', title: 'Nhà cung cấp', icon: Van, roles: ['ADMIN', 'MANAGER'] },
      { path: '/customers', title: 'Khách hàng', icon: User, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'NHÂN SỰ & BÁO CÁO',
    items: [
      { path: '/employees', title: 'Quản lý nhân viên', icon: Avatar, roles: ['ADMIN', 'MANAGER'] },
      { path: '/reports', title: 'Báo cáo & Thống kê', icon: DataAnalysis, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/users', title: 'Tài khoản & Phân quyền', icon: Lock, roles: ['ADMIN', 'MANAGER'] }
    ]
  }
]

