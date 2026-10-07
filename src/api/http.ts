import axios, { type AxiosError } from 'axios'
import { env } from '@/config/env'
import type { ApiErrorResponse, ApiErrorStatus } from '@types'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from './ApiError'
import { errorHandlers, isHandledStatus } from './middlewares/errors'

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Opt out of global error handlers for this request.
     * true skips all of them, an array skips only listed statuses.
     * The request still rejects with ApiError either way.
     * @example http.get('movies/1', { skipErrorHandler: [404] })
     */
    skipErrorHandler?: boolean | ApiErrorStatus[]
    /**
     * Resource key the request belongs to, set by api store.
     * Lets error handlers write state (e.g. 422 errors) back under the right key
     */
    resourceKey?: string
  }
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Global request middleware.
 * Sends the session token as Bearer, so protected endpoints (holds, orders) know the user.
 * Store is resolved per request, it is not ready yet when this module loads
 */
http.interceptors.request.use((config) => {
  const { token } = useAuthStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Global response middleware.
 * Runs matching status handler, then rejects with normalized ApiError
 * so callers can still react (e.g. render 422 validation messages)
 */
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Cancelled requests are not errors worth handling
    if (axios.isCancel(error)) return Promise.reject(error)

    const apiError = new ApiError(error)
    const { status } = apiError
    const skip = error.config?.skipErrorHandler

    const isSkipped =
      skip === true || (Array.isArray(skip) && skip.includes(status as ApiErrorStatus))

    if (!isSkipped && isHandledStatus(status)) {
      errorHandlers[status].handle(apiError)
    }

    return Promise.reject(apiError)
  },
)
