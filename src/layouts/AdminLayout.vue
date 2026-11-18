<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Brand Logo -->
      <div class="brand-logo" @click="$router.push('/dashboard')">
        <div class="logo-mark">S</div>
        <div v-if="!isCollapsed" class="logo-text">
          <span class="title">SNEAKERHUB</span>
          <span class="subtitle">MANAGEMENT SYSTEM</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <el-scrollbar class="menu-scroll">
        <nav class="nav-menu">
          <div
            v-for="group in visibleMenuGroups"
            :key="group.groupTitle"
            class="menu-group"
          >
            <div v-if="!isCollapsed" class="group-label">{{ group.groupTitle }}</div>
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: $route.path.startsWith(item.path) }"
            >
              <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
              <span v-if="!isCollapsed" class="menu-title">{{ item.title }}</span>
              <span v-if="!isCollapsed && item.badge" class="menu-badge">{{ item.badge }}</span>
            </router-link>
          </div>
        </nav>
      </el-scrollbar>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="db-status">
          <span class="dot pulse"></span>
          <span class="db-name">Oracle 19c+ Connected</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button
            class="collapse-btn"
            @click="isCollapsed = !isCollapsed"
            title="Thu gọn / Mở rộng menu"
          >
            <el-icon :size="18"><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </button>

          <el-breadcrumb separator="/" class="admin-breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">Quản trị</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta?.title || 'Tổng quan' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Quick link to storefront -->
          <router-link to="/" class="header-action-btn btn-store-view">
            <el-icon><Shop /></el-icon>
            <span>Xem Website Bán Hàng</span>
          </router-link>

          <!-- POS Quick Button -->
          <button
            class="header-action-btn btn-pos"
            @click="$router.push('/sales')"
          >
            <el-icon><ShoppingCart /></el-icon>
            <span>Bán hàng POS</span>
          </button>

          <!-- Roles Badge -->
          <div class="role-badges">
            <span
              v-for="r in authStore.roles"
              :key="r"
              class="role-pill"
              :class="r.toLowerCase()"
            >
              {{ r }}
            </span>
          </div>

          <!-- User Profile Dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-profile">
              <div class="avatar">{{ (authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}</div>
              <div class="user-info">
                <span class="name">{{ authStore.user?.fullName || authStore.user?.username }}</span>
                <span class="username">@{{ authStore.user?.username }}</span>
              </div>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon> Đổi mật khẩu
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> Đăng xuất hệ thống
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Main Content Route View -->
      <main class="content-area">
        <router-view />
      </main>
    </div>

    <!-- Change Password Modal -->
    <ChangePasswordDialog v-model="pwdDialogVisible" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ShoppingCart,
  Shop,
  Fold,
  Expand,
  ArrowDown,
  Key,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { MENU_GROUPS } from '@/constants/navigation'
import ChangePasswordDialog from './components/ChangePasswordDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const isCollapsed = ref(false)
const pwdDialogVisible = ref(false)

const visibleMenuGroups = computed(() => {
  return MENU_GROUPS
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => authStore.hasAnyRole(i.roles))
    }))
    .filter((g) => g.items.length > 0)
})

function handleCommand(cmd) {
  if (cmd === 'password') {
    pwdDialogVisible.value = true
  } else if (cmd === 'logout') {
    ElMessageBox.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý?', 'Xác nhận đăng xuất', {
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      type: 'warning'
    }).then(async () => {
      await authStore.logout()
      ElMessage.success('Đã đăng xuất thành công')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #09090b;
  color: #f4f4f5;
  display: flex;
  flex-direction: column;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  border-right: 1px solid #18181b;
  flex-shrink: 0;

  &.collapsed {
    width: 68px;
  }

  .brand-logo {
    height: 60px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    border-bottom: 1px solid #18181b;

    .logo-mark {
      width: 32px;
      height: 32px;
      background: #ffffff;
      color: #000000;
      font-weight: 900;
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      flex-shrink: 0;
      letter-spacing: -0.05em;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;

      .title {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #ffffff;
      }

      .subtitle {
        font-size: 9px;
        font-weight: 700;
        color: #71717a;
        letter-spacing: 0.12em;
        margin-top: 2px;
      }
    }
  }

  .menu-scroll {
    flex: 1;
    padding: 14px 10px;
  }

  .menu-group {
    margin-bottom: 20px;

    .group-label {
      font-size: 10px;
      font-weight: 800;
      color: #71717a;
      padding: 6px 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    border-radius: 6px;
    color: #a1a1aa;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 3px;
    transition: all 0.15s ease;

    .menu-icon {
      font-size: 16px;
      flex-shrink: 0;
      color: #71717a;
      transition: color 0.15s ease;
    }

    .menu-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-badge {
      background: #27272a;
      color: #e4e4e7;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }

    &:hover {
      background: #18181b;
      color: #ffffff;
      .menu-icon {
        color: #ffffff;
      }
    }

    &.active {
      background: #27272a;
      color: #ffffff;
      font-weight: 700;

      .menu-icon {
        color: #ffffff;
      }

      .menu-badge {
        background: #ffffff;
        color: #000000;
      }
    }
  }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid #18181b;
    background: #09090b;

    .db-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #71717a;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;

        &.pulse {
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }
      }

      .db-name {
        font-family: var(--font-mono);
        font-weight: 600;
      }
    }
  }
}

/* Main Area */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Header */
.top-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 6px;
      color: #52525b;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f4f4f5;
        color: #000000;
        border-color: #d4d4d8;
      }
    }

    .admin-breadcrumb {
      font-size: 13px;
      font-weight: 500;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;

      &.btn-store-view {
        background: #f4f4f5;
        border: 1px solid #e4e4e7;
        color: #18181b;

        &:hover {
          background: #e4e4e7;
          color: #000000;
        }
      }

      &.btn-pos {
        background: #000000;
        border: 1px solid #000000;
        color: #ffffff;

        &:hover {
          background: #27272a;
          border-color: #27272a;
        }
      }
    }

    .role-badges {
      display: flex;
      gap: 6px;

      .role-pill {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.06em;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #e4e4e7;
        background: #f4f4f5;
        color: #3f3f46;

        &.admin {
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        }

        &.manager {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;
        }
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.15s ease;

      &:hover {
        background: #f4f4f5;
        border-color: #e4e4e7;
      }

      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #000000;
        color: #ffffff;
        font-weight: 800;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .name {
          font-size: 12px;
          font-weight: 700;
          color: #09090b;
        }

        .username {
          font-size: 10px;
          color: #71717a;
        }
      }

      .arrow-icon {
        font-size: 12px;
        color: #71717a;
      }
    }
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: #f8fafc;
}
</style>
