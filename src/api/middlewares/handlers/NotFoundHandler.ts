import type { ApiError } from '../../ApiError'
import { ErrorHandler } from './ErrorHandler'
import router from '@/router'

/**
 * 404 Not Found
 * Renders NotFound page while keeping the current url
 */
export class NotFoundHandler extends ErrorHandler {
  handle(_error: ApiError): void {
    const { path, query, hash } = router.currentRoute.value
    router.replace({
      name: 'not-found',
      params: { pathMatch: path.substring(1).split('/') },
      query,
      hash,
    })
  }
}
