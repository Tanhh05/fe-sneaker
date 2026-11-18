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
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
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

        <!-- QUICK GOOGLE SIGN-IN BUTTON -->
        <div class="google-auth-box">
          <button class="google-btn" :disabled="loading" @click="openGooglePicker">
            <svg class="google-svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>TIẾP TỤC VỚI GOOGLE</span>
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

    <!-- QUICK GOOGLE ACCOUNT PICKER MODAL -->
    <el-dialog
      v-model="googlePickerVisible"
      title="Đăng nhập nhanh với Google"
      width="400px"
      append-to-body
      class="google-picker-dialog"
    >
      <div class="google-picker-body">
        <p class="google-picker-hint">Chọn một tài khoản Google để tiếp tục với <strong>SneakerHub</strong>:</p>

        <div class="google-account-list">
          <div
            v-for="acc in presetGoogleAccounts"
            :key="acc.email"
            class="google-acc-item"
            @click="selectGoogleAccount(acc)"
          >
            <div class="acc-avatar" :style="{ backgroundColor: acc.bgColor }">
              {{ acc.name.charAt(0).toUpperCase() }}
            </div>
            <div class="acc-meta">
              <div class="acc-name">{{ acc.name }}</div>
              <div class="acc-email">{{ acc.email }}</div>
            </div>
          </div>
        </div>

        <div class="google-custom-input">
          <div class="custom-lbl">Hoặc nhập Email Google của bạn:</div>
          <el-input
            v-model="customGoogleEmail"
            placeholder="example@gmail.com"
            size="small"
            style="margin-bottom: 8px"
          />
          <el-input
            v-model="customGoogleName"
            placeholder="Họ tên của bạn"
            size="small"
            style="margin-bottom: 8px"
          />
          <button
            class="google-custom-btn"
            :disabled="!customGoogleEmail.trim()"
            @click="submitCustomGoogle"
          >
            ĐĂNG NHẬP VỚI EMAIL NÀY
          </button>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

// GOOGLE PICKER STATE
const googlePickerVisible = ref(false)
const customGoogleEmail = ref('')
const customGoogleName = ref('')

const presetGoogleAccounts = [
  {
    name: 'Phan Tuấn Anh',
    email: 'tuananh.sneaker@gmail.com',
    bgColor: '#4285F4'
  },
  {
    name: 'Khách Hàng Thân Thiết',
    email: 'vip.sneakerhead@gmail.com',
    bgColor: '#EA4335'
  },
  {
    name: 'Nguyễn Văn Đạt',
    email: 'dat.nguyen.sneakers@gmail.com',
    bgColor: '#34A853'
  }
]

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

function openGooglePicker() {
  googlePickerVisible.value = true
}

async function selectGoogleAccount(acc) {
  googlePickerVisible.value = false
  loading.value = true
  try {
    await authStore.loginWithGoogle({
      email: acc.email,
      fullName: acc.name,
      googleId: 'google_' + Math.abs(acc.email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
    })
    ElMessage.success(`Đăng nhập Google thành công! Xin chào ${acc.name}.`)
    emit('update:modelValue', false)
    emit('authenticated', authStore.user)
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Đăng nhập Google thất bại!')
  } finally {
    loading.value = false
  }
}

async function submitCustomGoogle() {
  if (!customGoogleEmail.value.trim()) return
  const email = customGoogleEmail.value.trim()
  const name = customGoogleName.value.trim() || email.split('@')[0]
  googlePickerVisible.value = false
  loading.value = true
  try {
    await authStore.loginWithGoogle({
      email: email,
      fullName: name,
      googleId: 'google_' + Date.now()
    })
    ElMessage.success(`Đăng nhập Google thành công với ${email}!`)
    emit('update:modelValue', false)
    emit('authenticated', authStore.user)
  } catch (err) {
    ElMessage.error(err.response?.data?.message || 'Đăng nhập Google thất bại!')
  } finally {
    loading.value = false
  }
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

    &:hover {
      background: #f4f4f5;
      border-color: #000000;
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
      border-bottom: 1px solid #e4e4e7;
    }

    span {
      padding: 0 12px;
    }
  }
}

.auth-submit-btn {
  width: 100%;
  height: 46px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background: #27272a;
  }

  &:disabled {
    background: #e4e4e7;
    color: #a1a1aa;
    border-color: #e4e4e7;
    cursor: not-allowed;
  }
}

.auth-footer-prompt {
  text-align: center;
  margin-top: 18px;
  font-size: 12px;
  color: #71717a;

  .switch-link {
    background: none;
    border: none;
    font-weight: 800;
    color: #000000;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 6px;

    &:hover {
      color: #27272a;
    }
  }
}

/* LOGGED IN USER STYLES */
.auth-logged-in {
  .user-card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 18px;
    border-bottom: 1px solid #e4e4e7;
    margin-bottom: 16px;

    .user-avatar-circle {
      width: 52px;
      height: 52px;
      background: #000000;
      color: #ffffff;
      font-size: 20px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0;
      flex-shrink: 0;
    }

    .user-heading {
      display: flex;
      flex-direction: column;

      .user-greeting {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #71717a;
      }

      .user-name {
        font-size: 16px;
        font-weight: 900;
        color: #000000;
        margin: 2px 0 4px;
      }

      .user-role-badge {
        font-size: 10px;
        font-weight: 800;
        color: #10b981;
        letter-spacing: 0.05em;
      }
    }
  }

  .user-details-list {
    background: #f4f4f5;
    padding: 12px 14px;
    margin-bottom: 20px;

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .lbl {
        color: #71717a;
      }

      .val {
        font-weight: 700;
        color: #000000;
      }
    }
  }

  .auth-actions-group {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .auth-btn {
      width: 100%;
      height: 42px;
      border-radius: 0;
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;

      .btn-icon {
        width: 16px;
        height: 16px;
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
        color: #000000;
        border: 1px solid #d4d4d8;

        &:hover {
          background: #e4e4e7;
          border-color: #000000;
        }
      }

      &.outline-danger {
        background: #ffffff;
        color: #ef4444;
        border: 1px solid #ef4444;

        &:hover {
          background: #ef4444;
          color: #ffffff;
        }
      }
    }
  }
}

/* GOOGLE PICKER STYLES */
.google-picker-body {
  font-family: var(--font-sans);

  .google-picker-hint {
    font-size: 13px;
    color: #525252;
    margin-bottom: 14px;
  }

  .google-account-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    .google-acc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid #e4e4e7;
      cursor: pointer;
      transition: all 0.12s ease;

      &:hover {
        background: #f4f4f5;
        border-color: #000000;
      }

      .acc-avatar {
        width: 36px;
        height: 36px;
        color: #ffffff;
        font-weight: 800;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .acc-meta {
        display: flex;
        flex-direction: column;

        .acc-name {
          font-size: 13px;
          font-weight: 800;
          color: #000000;
        }

        .acc-email {
          font-size: 11px;
          color: #71717a;
        }
      }
    }
  }

  .google-custom-input {
    border-top: 1px solid #e4e4e7;
    padding-top: 12px;

    .custom-lbl {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #71717a;
      margin-bottom: 6px;
    }

    .google-custom-btn {
      width: 100%;
      height: 34px;
      background: #18181b;
      color: #ffffff;
      border: none;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: #000000;
      }

      &:disabled {
        background: #e4e4e7;
        color: #a1a1aa;
        cursor: not-allowed;
      }
    }
  }
}
</style>
