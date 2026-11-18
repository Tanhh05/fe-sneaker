<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <div class="error-badge">
        <span class="status-code">ERROR 403</span>
        <span class="status-divider">•</span>
        <span class="status-text">ACCESS DENIED</span>
      </div>

      <div class="glitch-title-box">
        <h1 class="main-title">BẠN KHÔNG CÓ QUYỀN TRUY CẬP</h1>
        <p class="subtitle">
          Tài khoản hiện tại không có quyền hạn quản trị để truy cập vào phân hệ này.
        </p>
      </div>

      <!-- CURRENT ACCOUNT INFO CARD -->
      <div v-if="authStore.isAuthenticated" class="user-info-box">
        <div class="info-row">
          <span class="lbl">TÀI KHOẢN ĐANG ĐĂNG NHẬP:</span>
          <span class="val">@{{ authStore.user?.username }} ({{ authStore.user?.fullName || 'Thành viên' }})</span>
        </div>
        <div class="info-row" v-if="authStore.user?.email">
          <span class="lbl">EMAIL:</span>
          <span class="val">{{ authStore.user?.email }}</span>
        </div>
        <div class="info-row">
          <span class="lbl">VAI TRÒ HIỆN TẠI:</span>
          <span class="val role-tag">{{ roleDisplay }}</span>
        </div>
        <div class="info-note">
          * Phân hệ quản trị (POS &amp; Quản lý cửa hàng) chỉ mở cho các tài khoản có quyền <strong>ADMIN, QUẢN LÝ (MANAGER) hoặc NHÂN VIÊN (STAFF)</strong>.
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="actions-group">
        <button class="btn primary" @click="goToStore">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          VỀ TRANG CHỦ MUA SẮM (CLIENT STORE)
        </button>

        <button class="btn secondary" @click="goToTracking">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          TRA CỨU &amp; THEO DÕI ĐƠN HÀNG
        </button>

        <button class="btn outline-danger" @click="handleSwitchAccount">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          ĐĂNG XUẤT ĐỂ ĐĂNG NHẬP TÀI KHOẢN QUẢN TRỊ
        </button>
      </div>

      <div class="footer-brand">
        <span>SNEAKERHUB ARCHIVE • SECURITY ENFORCEMENT</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const roleDisplay = computed(() => {
  const roles = authStore.roles || []
  if (roles.includes('ADMIN')) return 'QUẢN TRỊ VIÊN (ADMIN)'
  if (roles.includes('MANAGER')) return 'QUẢN LÝ CỬA HÀNG (MANAGER)'
  if (roles.includes('STAFF')) return 'NHÂN VIÊN BÁN HÀNG (STAFF)'
  if (roles.includes('CUSTOMER')) return 'THÀNH VIÊN KHÁCH HÀNG (CUSTOMER)'
  return roles.length ? roles.join(', ') : 'KHÁCH VÃNG LAI'
})

function goToStore() {
  router.push('/')
}

function goToTracking() {
  router.push('/tracking')
}

async function handleSwitchAccount() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #09090b;
  background-image: 
    radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.08) 0%, transparent 60%),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 32px 32px, 32px 32px;
  padding: 24px;
  box-sizing: border-box;
  font-family: var(--font-sans);
}

.forbidden-card {
  width: 100%;
  max-width: 540px;
  background: #ffffff;
  border: 2px solid #18181b;
  padding: 36px 32px 28px;
  box-shadow: 12px 12px 0px #000000;
  text-align: center;
  border-radius: 0;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1.5px solid #f87171;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #dc2626;
  margin-bottom: 20px;

  .status-code {
    font-family: var(--font-mono, monospace);
  }

  .status-divider {
    opacity: 0.4;
  }
}

.glitch-title-box {
  margin-bottom: 24px;

  .main-title {
    margin: 0 0 10px;
    font-size: 22px;
    font-weight: 900;
    color: #000000;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #52525b;
  }
}

.user-info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
  border-radius: 0;

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 6px 0;
    border-bottom: 1px dashed #e2e8f0;

    &:last-of-type {
      border-bottom: none;
    }

    .lbl {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .val {
      font-weight: 700;
      color: #0f172a;

      &.role-tag {
        background: #fee2e2;
        color: #991b1b;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        border: 1px solid #fca5a5;
      }
    }
  }

  .info-note {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 11px;
    line-height: 1.4;
    color: #64748b;

    strong {
      color: #0f172a;
    }
  }
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;

  .btn {
    width: 100%;
    height: 44px;
    border-radius: 0;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.15s ease;

    .btn-icon {
      width: 15px;
      height: 15px;
    }

    &.primary {
      background: #000000;
      color: #ffffff;
      border: 1.5px solid #000000;

      &:hover {
        background: #27272a;
        border-color: #27272a;
      }
    }

    &.secondary {
      background: #f4f4f5;
      color: #18181b;
      border: 1.5px solid #d4d4d8;

      &:hover {
        background: #e4e4e7;
        border-color: #18181b;
      }
    }

    &.outline-danger {
      background: #ffffff;
      color: #dc2626;
      border: 1.5px solid #fca5a5;

      &:hover {
        background: #fef2f2;
        border-color: #dc2626;
      }
    }
  }
}

.footer-brand {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #a1a1aa;
}
</style>
