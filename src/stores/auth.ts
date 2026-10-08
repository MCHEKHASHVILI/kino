import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthenticationResponse, UserAuthenticationForm, UserProfile } from '@types'
import { useModalStore } from './modals'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from './api'
import { useBookingStore } from './booking'
import { useTicketsStore } from './tickets'

export const useAuthStore = defineStore('auth', () => {
  const api = useApiStore()
  const { validationErrorsOf } = api
  const { inputIconStatus } = storeToRefs(api)

  // State
  const email = ref<UserAuthenticationForm['email']>()
  const password = ref<UserAuthenticationForm['password']>()
  const user = ref<UserProfile | null>(JSON.parse(localStorage.getItem('user') || '{}'))
  const token = ref<string | null>(localStorage.getItem('token') || null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && token.value !== null)
  const isAuthorized = computed(
    () => user.value && Object.keys(user.value).length && user.value.profileComplete,
  )
  const initials = computed(() => {
    if (!user.value || !user.value.fullName) return ''
    const names = user.value.fullName.split(' ')
    return names.map((name) => name.charAt(0)).join('')
  })

  // First word of the full name, stray spaces ignored
  const firstName = computed(() => user.value?.fullName?.trim().split(/\s+/)[0] ?? '')

  const userName = computed(() => {
    if (!user.value || !user.value.username) return ''
    return user.value.username
  })

  const isProfileComplete = computed(() => {
    if (!user.value) return false
    return user.value.profileComplete
  })

  const avatar = computed(() => {
    if (!user.value || !user.value.avatar) return null
    return user.value.avatar
  })
  const fullName = computed(() => {
    if (!user.value || !user.value.fullName) return ''
    return user.value.fullName
  })

  const isLoading = computed(() => api.isLoading('login'))
  // Wrong credentials, guest 401 is left to the caller by UnauthenticatedHandler
  const isUnauthorized = computed(() => api.errorOf('login')?.status === 401)

  // Actions
  async function login(): Promise<void> {
    const credentials: UserAuthenticationForm = {
      email: email.value,
      password: password.value,
    }
    // On failure ApiError is kept in api store, read it with api.errorOf('login')
    const response = await api
      .post<{ data: AuthenticationResponse }>('login', 'login', credentials)
      .catch(() => null)
    if (!response) return

    authenticate(response.data)
    const modalStore = useModalStore()
    const { closeModal } = modalStore
    closeModal()
    // In the background, the modal doesn't wait for it
    useTicketsStore().fetchTickets()
  }

  function authenticate(data: AuthenticationResponse) {
    user.value = data.user
    token.value = data.token

    // Persist to local storage to maintain session on refresh
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
  }

  /**
   * App start with a stored token: GET /me refreshes the stored user (personal information).
   * 401 means the token is stale (API: drop it, treat as guest), so the session is cleared
   * without the global handler's login modal. Resolves whether the user is still signed in
   */
  async function restoreSession(): Promise<boolean> {
    if (!isAuthenticated.value) return false
    try {
      const response = await api.get<{ data: UserProfile }>('me', 'me', {
        skipErrorHandler: [401],
      })
      setUser(response.data)
      return true
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        clearSession()
        return false
      }
      // Network or server error, the stored user stays
      return true
    }
  }

  // Profile updates return the fresh user, token stays the same
  function setUser(data: UserProfile) {
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  /**
   * Signing out: held seats go back onto the map and the token is revoked (POST /logout)
   * while the token still works, then the stored session is cleared regardless of the responses.
   * Global handlers are skipped, a 401 here must not start another logout
   */
  async function logout(): Promise<void> {
    await useBookingStore().releaseHold()
    await api.post('logout', 'logout', undefined, { skipErrorHandler: true }).catch(() => null)
    clearSession()
  }

  // Token already rejected (401), so nothing can be revoked or released with it, only local state goes
  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    useTicketsStore().reset()
  }

  return {
    email,
    password,
    user,
    token,
    login,
    logout,
    clearSession,
    authenticate,
    setUser,
    restoreSession,
    isAuthorized,
    isAuthenticated,
    initials,
    firstName,
    userName,
    isProfileComplete,
    avatar,
    fullName,
    isLoading,
    isUnauthorized,
    validationErrorsOf,
    inputIconStatus,
  }
})
