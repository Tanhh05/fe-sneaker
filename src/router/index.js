import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Đăng nhập hệ thống', public: true }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard Tổng quan', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'sales',
        name: 'SalesPos',
        component: () => import('@/views/sales/SalesPosView.vue'),
        meta: { title: 'Bán hàng tại quầy (POS)', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrdersView.vue'),
        meta: { title: 'Quản lý đơn hàng', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/ProductsView.vue'),
        meta: { title: 'Quản lý sản phẩm', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'variants',
        name: 'Variants',
        component: () => import('@/views/variants/VariantsView.vue'),
        meta: { title: 'Biến thể sản phẩm (SKU, Size, Màu sắc)', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoriesView.vue'),
        meta: { title: 'Quản lý danh mục', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'brands',
        name: 'Brands',
        component: () => import('@/views/brands/BrandsView.vue'),
        meta: { title: 'Quản lý thương hiệu', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'purchases',
        name: 'Purchases',
        component: () => import('@/views/purchases/PurchasesView.vue'),
        meta: { title: 'Quản lý nhập hàng', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('@/views/suppliers/SuppliersView.vue'),
        meta: { title: 'Quản lý nhà cung cấp', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/customers/CustomersView.vue'),
        meta: { title: 'Quản lý khách hàng', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/employees/EmployeesView.vue'),
        meta: { title: 'Quản lý nhân viên', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportsView.vue'),
        meta: { title: 'Báo cáo & Thống kê', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UsersView.vue'),
        meta: { title: 'Quản lý tài khoản & Phân quyền', roles: ['ADMIN', 'MANAGER'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta?.title || 'Hệ thống'} | SNEAKERHUB PRO`
  const authStore = useAuthStore()

  if (to.meta?.public) {
    if (authStore.isAuthenticated) {
      return next('/dashboard')
    }
    return next()
  }

  if (!authStore.isAuthenticated) {
    return next('/login')
  }

  const allowedRoles = to.meta?.roles
  if (allowedRoles && !authStore.hasAnyRole(allowedRoles)) {
    ElMessage.warning('Bạn không có quyền truy cập màn hình này')
    return next('/dashboard')
  }

  next()
})

export default router
