<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <div class="code-403">403</div>
      <h1 class="forbidden-title">KHÔNG CÓ QUYỀN TRUY CẬP</h1>
      <p class="forbidden-desc">Bạn không có quyền truy cập vào màn hình này.</p>

      <button class="btn-back" @click="goToStore">
        QUAY LẠI TRANG CHỦ
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToStore() {
  router.push('/')
}
</script>

<style scoped lang="scss">
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 24px;
  box-sizing: border-box;
  font-family: var(--font-sans);
}

.forbidden-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 48px 32px;
  text-align: center;
  border-radius: 8px;

  .code-403 {
    font-size: 72px;
    font-weight: 900;
    line-height: 1;
    color: #0f172a;
    letter-spacing: -0.04em;
    font-family: var(--font-mono, monospace);
    margin-bottom: 12px;
  }

  .forbidden-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }

  .forbidden-desc {
    margin: 0 0 28px;
    font-size: 14px;
    color: #64748b;
  }

  .btn-back {
    height: 42px;
    padding: 0 24px;
    background: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #1e293b;
    }
  }
}
</style>
