<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="logo-box">SNK</div>
        <div>
          <h1>SNEAKER<span>HUB</span> PRO</h1>
          <p>Hệ Thống Quản Lý Cửa Hàng Giày Sneaker Nội Bộ</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="Tên đăng nhập" prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="Nhập username (vd: admin, manager, staff)"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="Mật khẩu" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            size="large"
            show-password
            placeholder="Nhập mật khẩu (mặc định: 123456)"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          Đăng nhập vào hệ thống
        </el-button>
      </el-form>

      <div class="demo-accounts">
        <div class="demo-title">Tài khoản mẫu (Click để điền nhanh):</div>
        <div class="demo-buttons">
          <el-button size="small" @click="fillDemo('admin', '123456')">
            ADMIN (admin / 123456)
          </el-button>
          <el-button size="small" @click="fillDemo('manager', '123456')">
            MANAGER (manager / 123456)
          </el-button>
          <el-button size="small" @click="fillDemo('staff', '123456')">
            STAFF (staff / 123456)
          </el-button>
        </div>
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
      ElMessage.success(`Chào mừng ${authStore.user?.fullName || form.username}!`)
      router.push('/dashboard')
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
  background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 65%, #020617 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  border-top: 5px solid #f97316;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;

  .logo-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #0f172a;
    color: #f97316;
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  h1 {
    font-size: 21px;
    font-weight: 800;
    color: #0f172a;
    span {
      color: #f97316;
    }
  }

  p {
    font-size: 12.5px;
    color: #64748b;
    margin-top: 2px;
  }
}

.login-btn {
  width: 100%;
  font-weight: 700;
  margin-top: 6px;
  height: 44px;
}

.demo-accounts {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;

  .demo-title {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 10px;
  }

  .demo-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

