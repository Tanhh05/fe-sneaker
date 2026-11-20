<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="logo-mark">S</div>
        <div class="brand-text">
          <h1>SNEAKERHUB</h1>
          <p>HỆ THỐNG QUẢN LÝ CỬA HÀNG & BÁN LẺ POS</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
        class="login-form"
      >
        <el-form-item label="Tài khoản truy cập" prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="Tên đăng nhập (vd: admin, manager, staff)"
            :prefix-icon="User"
            class="input-custom"
          />
        </el-form-item>

        <el-form-item label="Mật khẩu bảo mật" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            size="large"
            show-password
            placeholder="Nhập mật khẩu"
            :prefix-icon="Lock"
            class="input-custom"
          />
        </el-form-item>

        <button
          type="button"
          class="btn-login-submit"
          :disabled="loading"
          @click="handleLogin"
        >
          <span v-if="loading">ĐANG XÁC THỰC...</span>
          <span v-else>ĐĂNG NHẬP VÀO HỆ THỐNG →</span>
        </button>
      </el-form>

      <div class="demo-accounts">
        <div class="demo-title">ĐIỀN NHANH TÀI KHOẢN MẪU:</div>
        <div class="demo-buttons">
          <button class="demo-pill" @click="fillDemo('admin', '123456')">
            <span class="pill-role admin">ADMIN</span>
            <span class="pill-acc">admin / 123456</span>
          </button>
          <button class="demo-pill" @click="fillDemo('manager', '123456')">
            <span class="pill-role manager">MANAGER</span>
            <span class="pill-acc">manager / 123456</span>
          </button>
          <button class="demo-pill" @click="fillDemo('staff', '123456')">
            <span class="pill-role staff">STAFF</span>
            <span class="pill-acc">staff / 123456</span>
          </button>
        </div>
      </div>

      <div class="back-store-row">
        <router-link to="/" class="back-link">
          ← Quay lại Website Bán Hàng (Storefront)
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}

function fillDemo(u, p) {
  form.username = u
  form.password = p
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.login(form.username, form.password)
      ElMessage.success(`Đăng nhập thành công: ${authStore.user?.fullName || form.username}!`)
      router.push('/admin/dashboard')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #262626;
  border-radius: 0;
  padding: 44px 38px;
  box-shadow: none;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebebeb;

  .logo-mark {
    width: 38px;
    height: 38px;
    background: #000000;
    color: #ffffff;
    font-weight: 900;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    letter-spacing: -0.05em;
    flex-shrink: 0;
  }

  .brand-text {
    h1 {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #000000;
      margin: 0;
      line-height: 1.1;
    }

    p {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #737373;
      margin: 4px 0 0;
    }
  }
}

.login-form {
  :deep(.el-form-item__label) {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #000000;
    padding-bottom: 6px;
  }
}

.btn-login-submit {
  width: 100%;
  height: 50px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #262626;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.demo-accounts {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed #e5e5e5;

  .demo-title {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #737373;
    margin-bottom: 10px;
  }

  .demo-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .demo-pill {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 0;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s ease;

      .pill-role {
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 0.08em;
        padding: 3px 6px;
        border-radius: 0;

        &.admin {
          background: #000000;
          color: #ffffff;
        }

        &.manager {
          background: #f5f5f5;
          color: #000000;
          border: 1px solid #000000;
        }

        &.staff {
          background: #f5f5f5;
          color: #525252;
        }
      }

      .pill-acc {
        font-size: 12px;
        font-family: var(--font-mono);
        font-weight: 700;
        color: #525252;
      }

      &:hover {
        background: #000000;
        border-color: #000000;
        .pill-acc {
          color: #ffffff;
        }
      }
    }
  }
}

.back-store-row {
  margin-top: 24px;
  text-align: center;

  .back-link {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #737373;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: #000000;
    }
  }
}
</style>
