import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AxiosRequestConfig } from 'axios'
import { http } from '@/api/http'
import { isApiError, type ApiError } from '@/api/ApiError'
import type { ValidationErrors } from '@types'

/**
 * Shared request layer for resource stores.
 * Every request is tagged with a resource key (e.g. 'movies', 'movie.12'),
 * loading and error state is tracked per key, so several resources
 * can load at the same time independently.
 */
export const useApiStore = defineStore('api', () => {
  // State
  // key → number of in-flight requests (same key may be requested concurrently)
  const pending = ref<Record<string, number>>({})
  const errors = ref<Record<string, ApiError>>({})
  // 422 payloads written by ValidationHandler
  const messages = ref<Record<string, string>>({})
  const validationErrors = ref<Record<string, ValidationErrors>>({})

  // Getters
  const isLoading = computed(() => (key: string) => (pending.value[key] ?? 0) > 0)
  const isAnyLoading = computed(() => Object.keys(pending.value).length > 0)
  const errorOf = computed(() => (key: string) => errors.value[key] ?? null)
  const messageOf = computed(() => (key: string) => messages.value[key] ?? null)
  const validationErrorsOf = computed(() => (key: string) => validationErrors.value[key] ?? {})
  const firstValidationError = computed(
    () => (key: string, field: string) => validationErrors.value[key]?.[field]?.[0] ?? null,
  )

  const inputIconStatus = computed(() => (key: string, field: string): string | undefined => {
    const errors = validationErrors.value[key]
    if (!errors || Object.keys(errors).length === 0) return undefined
    return field in errors ? 'Error' : 'Success'
  })

  // Actions
  function start(key: string) {
    pending.value[key] = (pending.value[key] ?? 0) + 1
    clearError(key)
  }

  function finish(key: string) {
    const count = (pending.value[key] ?? 1) - 1
    if (count > 0) pending.value[key] = count
    else delete pending.value[key]
  }

  function clearError(key: string) {
    delete errors.value[key]
    delete messages.value[key]
    delete validationErrors.value[key]
  }

  function setMessage(key: string, message: string) {
    messages.value[key] = message
  }

  function setValidationErrors(key: string, errors: ValidationErrors) {
    validationErrors.value[key] = errors
  }

  /**
   * Performs request under given resource key and returns response body.
   * Rejects with ApiError (global handlers in api/middlewares already ran).
   * @param key resource key
   * @param config axios request config
   * @returns Promise<T>
   */
  async function request<T>(key: string, config: AxiosRequestConfig): Promise<T> {
    start(key)
    try {
      const { data } = await http.request<T>({ ...config, resourceKey: key })
      return data
    } catch (error) {
      if (isApiError(error)) errors.value[key] = error
      throw error
    } finally {
      finish(key)
    }
  }

  function get<T>(key: string, url: string, config?: AxiosRequestConfig) {
    return request<T>(key, { ...config, method: 'get', url })
  }

  function post<T>(key: string, url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>(key, { ...config, method: 'post', url, data })
  }

  function put<T>(key: string, url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>(key, { ...config, method: 'put', url, data })
  }

  function patch<T>(key: string, url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>(key, { ...config, method: 'patch', url, data })
  }

  function destroy<T>(key: string, url: string, config?: AxiosRequestConfig) {
    return request<T>(key, { ...config, method: 'delete', url })
  }

  return {
    pending,
    errors,
    messages,
    validationErrors,
    isLoading,
    isAnyLoading,
    errorOf,
    messageOf,
    validationErrorsOf,
    firstValidationError,
    inputIconStatus,
    clearError,
    setMessage,
    setValidationErrors,
    request,
    get,
    post,
    put,
    patch,
    destroy,
  }
})
