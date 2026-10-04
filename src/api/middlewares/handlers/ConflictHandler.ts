import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'

/**
 * 409 Conflict
 * Resource state conflict (e.g. already taken), the caller renders it
 */
export class ConflictHandler extends ErrorHandler {
  handle(_error: ApiError): void {}
}
