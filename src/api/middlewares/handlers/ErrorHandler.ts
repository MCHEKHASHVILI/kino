import type { ApiError } from '../../ApiError'

/**
 * Base for global response error handlers.
 * Each http status gets its own handler registered in middlewares/errors.ts
 */
export abstract class ErrorHandler {
  abstract handle(error: ApiError): void
}
