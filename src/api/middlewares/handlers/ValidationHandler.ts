import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import { useApiStore } from '@/stores/api'

/**
 * 422 Unprocessable Content
 * Response is either { message } or { message, errors }.
 * Field errors or the general message are written to api store
 * under request's resource key, so UI can read them from there.
 */
export class ValidationHandler extends ErrorHandler {
  handle(error: ApiError): void {
    const key = error.resourceKey
    // Request made directly via http, there is no resource to report to
    if (!key) return

    const api = useApiStore()
    if (error.hasValidationErrors) {
      api.setValidationErrors(key, error.errors)
    } else {
      api.setMessage(key, error.message)
    }
  }
}
