import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
/**
 * Redirects to action modal route.
 * Opens LogInModal for authentication and passes
 * redirect query to.fullPath
 * @param to
 * @returns
 */
export function requiresAuthentication(to: RouteLocationNormalizedGeneric) {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'action.modal',
      params: { reason: 'LogInModal' },
      // You can also add a query string to redirect back later
      query: { redirect: to.fullPath },
    }
  }
}

/**
 * Prevents Logged In users to break Guest guard
 * I works only for action.modal route because we dont need any other guard for now
 * It will not open LogInModal or RegistrationModal
 * when user is already logged in
 * @param to
 * @returns
 */
export function requiresGuest(to: RouteLocationNormalizedGeneric) {
  const authStore = useAuthStore()
  const meta = to.meta as { guestOnlyModals?: string[] }

  const requiresGuest =
    to.name === 'action.modal' &&
    meta.guestOnlyModals &&
    meta.guestOnlyModals?.includes(to.params.name as string)

  if (requiresGuest && authStore.isAuthenticated) return false
}
