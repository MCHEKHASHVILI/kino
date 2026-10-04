import type { AxiosError } from 'axios'
import type { ApiErrorResponse, ApiErrorStatus, ValidationErrors } from '@types'

/**
 * Normalized error every rejected http request resolves to,
 * so callers never have to dig through AxiosError internals
 */
export class ApiError extends Error {
  readonly status: ApiErrorStatus | number
  readonly errors: ValidationErrors
  readonly original: AxiosError
  readonly resourceKey: string | undefined

  constructor(error: AxiosError<ApiErrorResponse>) {
    super(error.response?.data?.message ?? error.message)
    this.name = 'ApiError'
    // status 0 means no response at all (network error, CORS, timeout)
    this.status = error.response?.status ?? 0
    this.errors = error.response?.data?.errors ?? {}
    this.original = error
    this.resourceKey = error.config?.resourceKey
  }

  /**
   * Whether response carries field level validation errors
   * or only a general message
   */
  get hasValidationErrors(): boolean {
    return Object.keys(this.errors).length > 0
  }

  /**
   * First validation message of a given field
   * @param field
   * @returns string | undefined
   */
  first(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
