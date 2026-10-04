import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import { env } from '@/config/env'

/**
 * 500 Server Error
 */
export class ServerErrorHandler extends ErrorHandler {
  handle(error: ApiError): void {
    // TODO: replace with toast notification once available
    if (env.isDev) console.error('[http] server error', error)
  }
}
