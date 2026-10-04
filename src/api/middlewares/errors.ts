import type { ApiErrorStatus } from '@types'
import type { ErrorHandler } from './handlers/ErrorHandler'
import { UnauthenticatedHandler } from './handlers/UnauthenticatedHandler'
import { ForbiddenHandler } from './handlers/ForbiddenHandler'
import { NotFoundHandler } from './handlers/NotFoundHandler'
import { ConflictHandler } from './handlers/ConflictHandler'
import { ValidationHandler } from './handlers/ValidationHandler'
import { ServerErrorHandler } from './handlers/ServerErrorHandler'

/**
 * Status → handler registry used by http response interceptor
 */
export const errorHandlers: Record<ApiErrorStatus, ErrorHandler> = {
  401: new UnauthenticatedHandler(),
  403: new ForbiddenHandler(),
  404: new NotFoundHandler(),
  409: new ConflictHandler(),
  422: new ValidationHandler(),
  500: new ServerErrorHandler(),
}

export function isHandledStatus(status: number): status is ApiErrorStatus {
  return status in errorHandlers
}
