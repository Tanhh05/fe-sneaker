import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const authStore = useAuthStore()

  const canManageCatalog = computed(() => authStore.hasAnyRole(['ADMIN', 'MANAGER']))
  const canManageUsers = computed(() => authStore.hasAnyRole(['ADMIN']))
  const canViewUsers = computed(() => authStore.hasAnyRole(['ADMIN', 'MANAGER']))
  const canManagePurchases = computed(() => authStore.hasAnyRole(['ADMIN', 'MANAGER']))

  return {
    canManageCatalog,
    canManageUsers,
    canViewUsers,
    canManagePurchases,
    hasAnyRole: authStore.hasAnyRole
  }
}

