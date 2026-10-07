import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

/**
 * 401 Unauthenticated
 * Token is missing/expired. Clears session and opens LogInModal,
 * passing current route as redirect.
 * Guests (e.g. wrong credentials on login) are left to the caller.
 */
export class UnauthenticatedHandler extends ErrorHandler {
  handle(_error: ApiError): void {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    // Token is already rejected, so no logout request, only the stored session is cleared
    authStore.clearSession()
    router.push({
      name: 'action.modal',
      params: { name: 'LogInModal' },
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}
