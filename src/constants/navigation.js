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
      { path: '/admin/dashboard', title: 'Dashboard Tổng quan', icon: Odometer, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/pos', title: 'Bán hàng tại quầy (POS)', icon: ShoppingCart, badge: 'POS', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/admin/orders', title: 'Quản lý đơn hàng', icon: Tickets, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'SẢN PHẨM & BIẾN THỂ',
    items: [
      { path: '/admin/products', title: 'Quản lý sản phẩm', icon: Goods, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/admin/variants', title: 'Biến thể SKU & Size/Màu', icon: SetUp, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/admin/categories', title: 'Danh mục giày', icon: Menu, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/admin/brands', title: 'Thương hiệu Sneaker', icon: CollectionTag, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'NHẬP HÀNG & ĐỐI TÁC',
    items: [
      { path: '/admin/purchases', title: 'Quản lý nhập hàng', icon: Box, roles: ['ADMIN', 'MANAGER'] },
      { path: '/admin/suppliers', title: 'Nhà cung cấp', icon: Van, roles: ['ADMIN', 'MANAGER'] },
      { path: '/admin/customers', title: 'Khách hàng', icon: User, roles: ['ADMIN', 'MANAGER', 'STAFF'] }
    ]
  },
  {
    groupTitle: 'NHÂN SỰ & BÁO CÁO',
    items: [
      { path: '/admin/employees', title: 'Quản lý nhân viên', icon: Avatar, roles: ['ADMIN', 'MANAGER'] },
      { path: '/admin/reports', title: 'Báo cáo & Thống kê', icon: DataAnalysis, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/admin/users', title: 'Tài khoản & Phân quyền', icon: Lock, roles: ['ADMIN', 'MANAGER'] }
    ]
  }
]

