<template>
  <div class="notfound-page">
    <div class="notfound-card">
      <div class="error-badge">
        <span class="status-code">ERROR 404</span>
        <span class="status-divider">•</span>
        <span class="status-text">PAGE NOT FOUND</span>
      </div>

      <div class="big-code-display">
        404
      </div>

      <div class="glitch-title-box">
        <h1 class="main-title">TRANG KHÔNG TỒN TẠI HOẶC ĐÃ BỊ THAY ĐỔI</h1>
        <p class="subtitle">
          Đường dẫn URL bạn yêu cầu không nằm trong hệ thống hoặc đã được điều hướng sang vị trí mới.
        </p>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="actions-group">
        <button class="btn primary" @click="goToStore">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          QUAY LẠI TRANG CHỦ MUA SẮM
        </button>

        <button v-if="authStore.isAdmin || authStore.isManager || authStore.isStaff" class="btn secondary" @click="goToAdmin">
          TRUY CẬP BẢNG ĐIỀU KHIỂN QUẢN TRỊ &rarr;
        </button>
      </div>

      <div class="footer-brand">
        <span>SNEAKERHUB ARCHIVE • NAVIGATION ASSIST</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function goToStore() {
  router.push('/')
}

function goToAdmin() {
  router.push('/admin/dashboard')
}
</script>

<style scoped lang="scss">
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #09090b;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  padding: 24px;
  box-sizing: border-box;
  font-family: var(--font-sans);
}

.notfound-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border: 2px solid #18181b;
  padding: 40px 32px 28px;
  box-shadow: 12px 12px 0px #000000;
  text-align: center;
  border-radius: 0;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f4f4f5;
  border: 1.5px solid #18181b;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #18181b;
  margin-bottom: 12px;

  .status-code {
    font-family: var(--font-mono, monospace);
  }

  .status-divider {
    opacity: 0.4;
  }
}

.big-code-display {
  font-size: 84px;
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 1;
  color: #000000;
  margin: 12px 0 16px;
  font-family: var(--font-mono, monospace);
}

.glitch-title-box {
  margin-bottom: 28px;

  .main-title {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 900;
    color: #000000;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #71717a;
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
  }
}

.footer-brand {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #a1a1aa;
}
</style>
