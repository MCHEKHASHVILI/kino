export type ApiErrorStatus = 401 | 403 | 404 | 409 | 422 | 500

/**
 * Laravel style validation bag: { field: ['message', ...] }
 */
export type ValidationErrors = Record<string, string[]>

export interface ApiErrorResponse {
  message?: string
  errors?: ValidationErrors
}
