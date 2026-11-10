import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sneaker_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('sneaker_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const roles = computed(() => user.value?.roles || [])
  const isAdmin = computed(() => roles.value.includes('ADMIN'))
  const isManager = computed(() => roles.value.includes('MANAGER') || roles.value.includes('ADMIN'))
  const isStaff = computed(() => roles.value.includes('STAFF'))

  async function login(username, password) {
    const res = await authService.login({ username, password })
    token.value = res.data.accessToken
    user.value = res.data.user
    localStorage.setItem('sneaker_token', token.value)
    localStorage.setItem('sneaker_user', JSON.stringify(user.value))
    return res.data
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (_) {
      // ignore
    } finally {
      token.value = ''
      user.value = null
      localStorage.removeItem('sneaker_token')
      localStorage.removeItem('sneaker_user')
    }
  }

  function hasAnyRole(allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.some((r) => roles.value.includes(r))
  }

  return {
    token,
    user,
    isAuthenticated,
    roles,
    isAdmin,
    isManager,
    isStaff,
    login,
    logout,
    hasAnyRole
  }
})
