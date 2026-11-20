import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import StoreLayout from '@/layouts/StoreLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  // ==========================================
  // CUSTOMER STOREFRONT ROUTES (PUBLIC)
  // ==========================================
  {
    path: '/',
    component: StoreLayout,
    children: [
      {
        path: '',
        name: 'StoreHome',
        component: () => import('@/views/store/StoreHomeView.vue'),
        meta: { title: 'Trang chủ Sneaker & Streetwear', public: true }
      },
      {
        path: 'shop',
        name: 'StoreCatalog',
        component: () => import('@/views/store/StoreCatalogView.vue'),
        meta: { title: 'Bộ sưu tập Sneaker chính hãng', public: true }
      },
      {
        path: 'product/:id',
        name: 'StoreProductDetail',
        component: () => import('@/views/store/StoreProductDetailView.vue'),
        meta: { title: 'Chi tiết sản phẩm', public: true }
      },
      {
        path: 'cart',
        name: 'StoreCart',
        component: () => import('@/views/store/StoreCartView.vue'),
        meta: { title: 'Giỏ hàng & Đặt hàng', public: true }
      },
      {
        path: 'order-success/:orderCode',
        name: 'StoreOrderSuccess',
        component: () => import('@/views/store/StoreOrderSuccessView.vue'),
        meta: { title: 'Đặt hàng thành công', public: true }
      },
      {
        path: 'tracking',
        name: 'StoreTrackOrder',
        component: () => import('@/views/store/StoreTrackOrderView.vue'),
        meta: { title: 'Tra cứu đơn hàng', public: true }
      },
      {
        path: 'my-orders',
        name: 'StoreMyOrders',
        component: () => import('@/views/store/StoreMyOrdersView.vue'),
        meta: { title: 'Quản lý đơn hàng của tôi', public: true }
      }
    ]
  },
  // Storefront Aliases
  { path: '/catalog', redirect: '/shop' },
  { path: '/order-tracking', redirect: '/tracking' },
  { path: '/account/orders', redirect: '/my-orders' },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Đăng nhập hệ thống quản lý', public: true, guestOnly: true }
  },

  // ==========================================
  // MODEL 1: POINT OF SALE (POS COUNTER)
  // ==========================================
  {
    path: '/pos',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'SalesPos',
        component: () => import('@/views/sales/SalesPosView.vue'),
        meta: { title: 'Bán hàng tại quầy (POS)', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      }
    ]
  },
  // POS Aliases
  { path: '/sales', redirect: '/pos' },
  { path: '/admin/pos', redirect: '/pos' },
  { path: '/admin/sales', redirect: '/pos' },

  // ==========================================
  // ENTERPRISE ADMIN MANAGEMENT PORTAL
  // ==========================================
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard Tổng quan', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrdersView.vue'),
        meta: { title: 'Quản lý đơn hàng', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetailView.vue'),
        meta: { title: 'Chi tiết đơn hàng', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/ProductsView.vue'),
        meta: { title: 'Quản lý sản phẩm', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },
      {
        path: 'products/create',
        name: 'ProductCreate',
        component: () => import('@/views/products/ProductFormView.vue'),
        meta: { title: 'Thêm sản phẩm Sneaker mới', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'products/:id/edit',
        name: 'ProductEdit',
        component: () => import('@/views/products/ProductFormView.vue'),
        meta: { title: 'Chỉnh sửa sản phẩm Sneaker', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'variants',
        name: 'Variants',
        component: () => import('@/views/variants/VariantsView.vue'),
        meta: { title: 'Biến thể SKU & Size/Màu', roles: ['ADMIN', 'MANAGER', 'STAFF'] }
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

  // Backward-compatibility shortcuts
  { path: '/dashboard', redirect: '/admin/dashboard' },
  { path: '/orders', redirect: '/admin/orders' },
  { path: '/orders/:id', redirect: (to) => `/admin/orders/${to.params.id}` },
  { path: '/products', redirect: '/admin/products' },
  { path: '/products/create', redirect: '/admin/products/create' },
  { path: '/products/:id/edit', redirect: (to) => `/admin/products/${to.params.id}/edit` },
  { path: '/variants', redirect: '/admin/variants' },
  { path: '/categories', redirect: '/admin/categories' },
  { path: '/brands', redirect: '/admin/brands' },
  { path: '/purchases', redirect: '/admin/purchases' },
  { path: '/suppliers', redirect: '/admin/suppliers' },
  { path: '/customers', redirect: '/admin/customers' },
  { path: '/employees', redirect: '/admin/employees' },
  { path: '/reports', redirect: '/admin/reports' },
  { path: '/users', redirect: '/admin/users' },

  // ==========================================
  // ERROR & ACCESS CONTROL SCREENS
  // ==========================================
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '403 Không có quyền truy cập', public: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '404 Không tìm thấy trang', public: true }
  },

  // Fallback route -> 404
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '404 Không tìm thấy trang', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta?.title || 'Trang chủ'} | SNEAKERHUB PRO`
  const authStore = useAuthStore()

  // 1. Guest-only routes like /login
  if (to.meta?.guestOnly) {
    if (authStore.isAuthenticated) {
      if (authStore.isAdmin || authStore.isManager || authStore.isStaff) {
        return next('/admin/dashboard')
      }
      return next('/403')
    }
    return next()
  }

  // 2. Public storefront & error pages
  if (to.meta?.public) {
    return next()
  }

  // 3. Admin routes: require authentication
  if (!authStore.isAuthenticated) {
    return next('/login')
  }

  // 4. Role check: redirect to 403 page if user does not have permission
  const allowedRoles = to.meta?.roles
  if (allowedRoles && !authStore.hasAnyRole(allowedRoles)) {
    return next('/403')
  }

  next()
})

export default router
