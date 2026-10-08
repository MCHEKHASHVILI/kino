import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import router from '@/router'
import { useApiStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'

/**
 * 422 Unprocessable Content
 * Response is either { message } or { message, errors }.
 * Field errors or the general message are written to api store
 * under request's resource key, so UI can read them from there.
 * A message only 422 is a blocked booking rule. Incomplete profile is one of them
 * (API: booking is blocked until profileComplete), that one sends the user to complete it.
 */
export class ValidationHandler extends ErrorHandler {
  handle(error: ApiError): void {
    const key = error.resourceKey
    // Request made directly via http, there is no resource to report to
    if (key) {
      const api = useApiStore()
      if (error.hasValidationErrors) api.setValidationErrors(key, error.errors)
      else api.setMessage(key, error.message)
    }

    // The flag decides rather than the message text, the other rules (age, started session,
    // expired hold) keep their message where the request was made
    const authStore = useAuthStore()
    if (!error.hasValidationErrors && authStore.isAuthenticated && !authStore.isProfileComplete) {
      // Leaving the page closes the booking modal, which releases any hold
      router.push({ name: 'profile', query: { tab: 'personal' } })
    }
  }
}
