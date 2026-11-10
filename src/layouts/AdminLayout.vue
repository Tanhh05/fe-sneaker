<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="brand-logo" @click="$router.push('/dashboard')">
        <div class="logo-badge">SNK</div>
        <div v-if="!isCollapsed" class="logo-text">
          <span class="title">SNEAKER<span class="accent">HUB</span></span>
          <span class="subtitle">MANAGEMENT PRO</span>
        </div>
      </div>

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

      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="db-status">
          <span class="dot"></span>
          <span>Oracle Database 19c+ Connected</span>
        </div>
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <el-button
            circle
            text
            @click="isCollapsed = !isCollapsed"
            title="Thu gọn / Mở rộng menu"
          >
            <el-icon :size="20"><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </el-button>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">Hệ thống</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta?.title || 'Tổng quan' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-button
            type="primary"
            size="small"
            @click="$router.push('/sales')"
            class="pos-quick-btn"
          >
            <el-icon style="margin-right: 5px"><ShoppingCart /></el-icon>
            Bán hàng POS
          </el-button>

          <el-tag
            v-for="r in authStore.roles"
            :key="r"
            :type="r === 'ADMIN' ? 'danger' : r === 'MANAGER' ? 'warning' : 'primary'"
            effect="dark"
            size="small"
          >
            {{ r }}
          </el-tag>

          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-profile">
              <div class="avatar">{{ (authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}</div>
              <div class="user-info">
                <div class="name">{{ authStore.user?.fullName || authStore.user?.username }}</div>
                <div class="username">@{{ authStore.user?.username }}</div>
              </div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon> Đổi mật khẩu
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> Đăng xuất
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Content Area -->
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
    ElMessageBox.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?', 'Xác nhận đăng xuất', {
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
}

.sidebar {
  width: 260px;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  border-right: 1px solid #1e293b;
  flex-shrink: 0;

  &.collapsed {
    width: 72px;
  }

  .brand-logo {
    height: 64px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    border-bottom: 1px solid #1e293b;

    .logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
      .title {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.03em;
        color: #ffffff;
        .accent {
          color: #f97316;
        }
      }
      .subtitle {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
        letter-spacing: 0.08em;
      }
    }
  }

  .menu-scroll {
    flex: 1;
    padding: 12px 10px;
  }

  .menu-group {
    margin-bottom: 16px;
    .group-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      padding: 6px 12px;
      letter-spacing: 0.06em;
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    color: #cbd5e1;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 4px;
    transition: all 0.18s ease;

    .menu-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .menu-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-badge {
      background: rgba(249, 115, 22, 0.2);
      color: #fb923c;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    &:hover {
      background: #1e293b;
      color: #ffffff;
    }

    &.active {
      background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.28);
      .menu-badge {
        background: #ffffff;
        color: #ea580c;
      }
    }
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid #1e293b;
    .db-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      color: #94a3b8;
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }
    }
  }
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.top-header {
  height: 64px;
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
    gap: 14px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 14px;

    .pos-quick-btn {
      font-weight: 700;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.15s;
      &:hover {
        background: #f1f5f9;
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #0f172a;
        color: #f97316;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-info {
        line-height: 1.2;
        .name {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }
        .username {
          font-size: 11.5px;
          color: #64748b;
        }
      }
    }
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
}
</style>
