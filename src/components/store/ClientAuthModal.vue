<template>
  <el-dialog
    :model-value="modelValue"
    width="480px"
    class="client-auth-dialog"
    :show-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="client-auth-wrapper">
      <!-- LOGGED IN STATE -->
      <div v-if="authStore.isAuthenticated" class="auth-logged-in">
        <div class="user-card-header">
          <div class="user-avatar-circle">
            {{ userInitials }}
          </div>
          <div class="user-heading">
            <span class="user-greeting">XIN CHÀO BẠN TRỞ LẠI</span>
            <h3 class="user-name">{{ authStore.user?.fullName || authStore.user?.username }}</h3>
            <span class="user-role-badge">
              {{ isStaffOrAdmin ? 'TÀI KHOẢN HỆ THỐNG (' + authStore.roles.join(', ') + ')' : 'THÀNH VIÊN SNEAKERHUB' }}
            </span>
          </div>
        </div>

        <div class="user-details-list">
          <div class="detail-row">
            <span class="lbl">Tên đăng nhập:</span>
            <span class="val">@{{ authStore.user?.username }}</span>
          </div>
          <div class="detail-row" v-if="authStore.user?.email">
            <span class="lbl">Email:</span>
            <span class="val">{{ authStore.user?.email }}</span>
          </div>
          <div class="detail-row" v-if="authStore.user?.phone">
            <span class="lbl">Số điện thoại:</span>
            <span class="val">{{ authStore.user?.phone }}</span>
          </div>
        </div>

        <div class="auth-actions-group">
          <button class="auth-btn primary" @click="goToTracking">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            TRA CỨU &amp; THEO DÕI ĐƠN HÀNG
          </button>

          <button v-if="isStaffOrAdmin" class="auth-btn secondary" @click="goToAdmin">
            TRUY CẬP KÊNH QUẢN TRỊ (ADMIN) &rarr;
          </button>

          <button class="auth-btn outline-danger" @click="handleLogout">
            ĐĂNG XUẤT TÀI KHOẢN
          </button>
        </div>
      </div>

      <!-- NOT LOGGED IN: TABS LOGIN / REGISTER -->
      <div v-else class="auth-guest">
        <div class="auth-modal-header">
          <span class="auth-brand-kicker">SNEAKERHUB CLUB ARCHIVE</span>
          <div class="auth-tabs">
            <button
              class="auth-tab"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              ĐĂNG NHẬP
            </button>
            <button
              class="auth-tab"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              ĐĂNG KÝ
            </button>
          </div>
        </div>

        <!-- QUICK GOOGLE SIGN-IN BUTTON (REAL GOOGLE IDENTITY SERVICES) -->
        <div class="google-auth-box">
          <button class="google-btn" :disabled="loading" @click="handleGoogleSignInClick">
            <svg class="google-svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{{ loading ? 'ĐANG KẾT NỐI GOOGLE...' : 'TIẾP TỤC VỚI GOOGLE' }}</span>
          </button>

          <div class="auth-divider">
            <span>HOẶC TIẾP TỤC VỚI TÀI KHOẢN</span>
          </div>
        </div>

        <!-- TAB 1: LOGIN FORM -->
        <div v-if="activeTab === 'login'" class="tab-pane">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
            <el-form-item label="Tên đăng nhập hoặc Email (*)" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="Nhập username hoặc email..."
                clearable
              />
            </el-form-item>

            <el-form-item label="Mật khẩu bảo mật (*)" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                show-password
                placeholder="Nhập mật khẩu của bạn..."
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <button class="auth-submit-btn" :disabled="loading" @click.prevent="handleLogin">
              {{ loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP VÀO SNEAKERHUB' }}
            </button>
          </el-form>

          <div class="auth-footer-prompt">
            <span>Chưa là thành viên?</span>
            <button class="switch-link" @click="activeTab = 'register'">Đăng ký ngay bây giờ &rarr;</button>
          </div>
        </div>

        <!-- TAB 2: REGISTER FORM -->
        <div v-else class="tab-pane">
          <el-form ref="regFormRef" :model="regForm" :rules="regRules" label-position="top">
            <el-form-item label="Họ và tên đầy đủ (*)" prop="fullName">
              <el-input v-model="regForm.fullName" placeholder="VD: Phan Tuấn Anh" />
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="Tên đăng nhập (*)" prop="username">
                  <el-input v-model="regForm.username" placeholder="VD: tuananh26" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số điện thoại (*)" prop="phone">
                  <el-input v-model="regForm.phone" placeholder="09xxxxxxxx" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="Địa chỉ Email" prop="email">
              <el-input v-model="regForm.email" placeholder="VD: tuananh@gmail.com" />
            </el-form-item>

            <el-form-item label="Địa chỉ nhận hàng mặc định" prop="address">
              <el-input v-model="regForm.address" placeholder="Số nhà, đường, quận/huyện, tỉnh thành..." />
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="Mật khẩu (*)" prop="password">
                  <el-input v-model="regForm.password" type="password" show-password placeholder="Tối thiểu 6 ký tự" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Nhập lại mật khẩu (*)" prop="confirmPassword">
                  <el-input v-model="regForm.confirmPassword" type="password" show-password placeholder="Xác nhận mật khẩu" />
                </el-form-item>
              </el-col>
            </el-row>

            <button class="auth-submit-btn" :disabled="loading" @click.prevent="handleRegister">
              {{ loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN THÀNH VIÊN' }}
            </button>
          </el-form>

          <div class="auth-footer-prompt">
            <span>Đã có tài khoản?</span>
            <button class="switch-link" @click="activeTab = 'login'">Đăng nhập ngay &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['update:modelValue', 'authenticated'])

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref(props.initialTab)
const loading = ref(false)

const isStaffOrAdmin = computed(() => authStore.isAdmin || authStore.isManager || authStore.isStaff)

const userInitials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

// LOGIN STATE
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}

// REGISTER STATE
const regFormRef = ref(null)
const regForm = reactive({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const regRules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không đúng định dạng', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
    {
      validator: (rule, val, cb) => {
        if (val !== regForm.password) cb(new Error('Mật khẩu nhập lại không khớp'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

// GOOGLE OAUTH STATE & REAL API INTEGRATION
const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '419627574811-tpt81mo08bmgj5i2mj8iodm7ijlk9kvj.apps.googleusercontent.com'

let googleTokenClient = null

function initGoogleServices() {
  if (typeof window === 'undefined') return
  if (!window.google?.accounts) {
    setTimeout(initGoogleServices, 600)
    return
  }

  const clientId = googleClientId?.trim()
  if (!clientId) return

  try {
    // Khởi tạo Google Identity Services ID Token flow
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    })

    // Khởi tạo Google OAuth 2.0 Token Client để mở popup khi click button
    googleTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse?.error) {
          ElMessage.error(`Đăng nhập Google thất bại: ${tokenResponse.error_description || tokenResponse.error}`)
          return
        }
        if (tokenResponse?.access_token) {
          await authenticateWithGoogleBackend({ accessToken: tokenResponse.access_token })
        }
      }
    })
  } catch (err) {
    console.warn('Google Identity Services khởi tạo thông báo:', err)
  }
}

onMounted(() => {
  initGoogleServices()
})

async function handleGoogleCredentialResponse(response) {
  if (response?.credential) {
    await authenticateWithGoogleBackend({ idToken: response.credential })
  }
}

async function handleGoogleSignInClick() {
  if (window.google?.accounts?.oauth2) {
    if (!googleTokenClient) {
      initGoogleServices()
    }
    if (googleTokenClient) {
      googleTokenClient.requestAccessToken({ prompt: 'select_account' })
      return
    }
  }

  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt()
  } else {
    ElMessage.info('Đang kết nối tới dịch vụ Google, vui lòng thử lại sau giây lát...')
  }
}

async function authenticateWithGoogleBackend(payload) {
  loading.value = true
  try {
    const res = await authStore.loginWithGoogle(payload)
    const displayName = res.user?.fullName || res.user?.username || 'Thành viên Google'
    ElMessage.success({
      message: `Đăng nhập Google thành công! Chào mừng ${displayName}.`,
      duration: 3500
    })
    emit('update:modelValue', false)
    emit('authenticated', authStore.user)
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Xác thực tài khoản Google qua máy chủ thất bại!'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

// ACTIONS
async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.login(loginForm.username, loginForm.password)
      ElMessage.success(`Xin chào, ${authStore.user?.fullName || authStore.user?.username}! Đăng nhập thành công.`)
      emit('update:modelValue', false)
      emit('authenticated', authStore.user)
    } catch (err) {
      ElMessage.error(err.response?.data?.message || 'Đăng nhập không thành công, vui lòng thử lại!')
    } finally {
      loading.value = false
    }
  })
}

async function handleRegister() {
  if (!regFormRef.value) return
  await regFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.register({
        fullName: regForm.fullName,
        username: regForm.username,
        email: regForm.email || undefined,
        phone: regForm.phone,
        address: regForm.address || undefined,
        password: regForm.password
      })
      ElMessage.success('Đăng ký tài khoản thành viên thành công! Chào mừng bạn gia nhập SneakerHub.')
      emit('update:modelValue', false)
      emit('authenticated', authStore.user)
    } catch (err) {
      ElMessage.error(err.response?.data?.message || 'Đăng ký không thành công, vui lòng kiểm tra lại thông tin!')
    } finally {
      loading.value = false
    }
  })
}

async function handleLogout() {
  await authStore.logout()
  ElMessage.info('Bạn đã đăng xuất tài khoản thành công.')
  emit('update:modelValue', false)
}

function goToTracking() {
  emit('update:modelValue', false)
  router.push('/tracking')
}

function goToAdmin() {
  emit('update:modelValue', false)
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.client-auth-wrapper {
  padding: 4px 6px;
  font-family: var(--font-sans);
}

.auth-modal-header {
  text-align: center;
  margin-bottom: 20px;

  .auth-brand-kicker {
    display: inline-block;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: #71717a;
    margin-bottom: 12px;
  }

  .auth-tabs {
    display: flex;
    border-bottom: 2px solid #e4e4e7;
    margin-bottom: 18px;

    .auth-tab {
      flex: 1;
      padding: 10px 0;
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #71717a;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;

      &.active {
        color: #000000;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #000000;
        }
      }
    }
  }
}

.google-auth-box {
  margin-bottom: 18px;

  .google-btn {
    width: 100%;
    height: 44px;
    background: #ffffff;
    border: 1.5px solid #18181b;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #18181b;
    transition: all 0.15s ease;

    .google-svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      background: #f4f4f5;
      border-color: #000000;
    }

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  }

  .auth-divider {
    display: flex;
    align-items: center;
    margin: 18px 0 12px;
    color: #a1a1aa;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e4e4e7;
    }

    span {
      padding: 0 12px;
    }
  }
}

.tab-pane {
  :deep(.el-form-item) {
    margin-bottom: 16px;

    .el-form-item__label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #18181b;
      padding-bottom: 4px;
    }

    .el-input__wrapper {
      border-radius: 0;
      box-shadow: 0 0 0 1px #d4d4d8 inset;
      padding: 8px 12px;

      &.is-focus {
        box-shadow: 0 0 0 2px #000000 inset;
      }
    }
  }

  .auth-submit-btn {
    width: 100%;
    height: 44px;
    background: #000000;
    color: #ffffff;
    border: none;
    border-radius: 0;
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.15s ease;

    &:hover:not(:disabled) {
      background: #27272a;
    }

    &:disabled {
      background: #a1a1aa;
      cursor: not-allowed;
    }
  }

  .auth-footer-prompt {
    margin-top: 16px;
    text-align: center;
    font-size: 12px;
    color: #71717a;

    .switch-link {
      background: none;
      border: none;
      color: #000000;
      font-weight: 800;
      cursor: pointer;
      margin-left: 6px;
      text-decoration: underline;

      &:hover {
        color: #ef4444;
      }
    }
  }
}

/* LOGGED IN USER CARD */
.auth-logged-in {
  .user-card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e4e4e7;
    margin-bottom: 16px;

    .user-avatar-circle {
      width: 56px;
      height: 56px;
      background: #000000;
      color: #ffffff;
      font-weight: 900;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0;
      flex-shrink: 0;
    }

    .user-heading {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .user-greeting {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #71717a;
      }

      .user-name {
        margin: 0;
        font-size: 16px;
        font-weight: 900;
        color: #000000;
        letter-spacing: -0.02em;
      }

      .user-role-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        background: #f4f4f5;
        color: #18181b;
        padding: 2px 6px;
        margin-top: 2px;
        border: 1px solid #e4e4e7;
      }
    }
  }

  .user-details-list {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px 14px;
    margin-bottom: 20px;

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;

      .lbl {
        color: #64748b;
        font-weight: 600;
      }

      .val {
        color: #0f172a;
        font-weight: 700;
      }
    }
  }

  .auth-actions-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .auth-btn {
      width: 100%;
      height: 40px;
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
      gap: 8px;
      transition: all 0.15s ease;

      .btn-icon {
        width: 14px;
        height: 14px;
      }

      &.primary {
        background: #000000;
        color: #ffffff;
        border: 1px solid #000000;

        &:hover {
          background: #27272a;
        }
      }

      &.secondary {
        background: #f4f4f5;
        color: #18181b;
        border: 1px solid #d4d4d8;

        &:hover {
          background: #e4e4e7;
          border-color: #18181b;
        }
      }

      &.outline-danger {
        background: transparent;
        color: #dc2626;
        border: 1px solid #fecaca;

        &:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }
      }
    }
  }
}
</style>
