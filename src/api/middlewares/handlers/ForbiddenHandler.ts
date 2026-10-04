import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import router from '@/router'

/**
 * 403 Forbidden
 * User is authenticated but not allowed to access the resource
 */
export class ForbiddenHandler extends ErrorHandler {
  handle(_error: ApiError): void {
    router.replace({ name: 'home' })
  }
}
