import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

/**
 * 401 Unauthenticated
 * Token is missing/expired, or a guest hit a protected endpoint (e.g. holding seats).
 * Clears the session if there is one and opens LogInModal, passing current route as redirect.
 * Wrong credentials on login are also 401, that request opts out and shows its own error.
 */
export class UnauthenticatedHandler extends ErrorHandler {
  handle(_error: ApiError): void {
    const authStore = useAuthStore()
    // Token is already rejected, so no logout request, only the stored session is cleared
    if (authStore.isAuthenticated) authStore.clearSession()
    router.push({
      name: 'action.modal',
      params: { name: 'LogInModal' },
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}
