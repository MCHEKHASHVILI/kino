import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthenticationResponse, UserAuthenticationForm, UserProfile } from '@types'
import { useModalStore } from './modals'
import { useApiStore } from './api'

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

  const firstName = computed(() => {
    if (!user.value || !user.value.fullName) return ''
    const names = user.value.fullName.split(' ')
    return names[0]
  })

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
  }

  function authenticate(data: AuthenticationResponse) {
    user.value = data.user
    token.value = data.token

    // Persist to local storage to maintain session on refresh
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
  }

  // Profile updates return the fresh user, token stays the same
  function setUser(data: UserProfile) {
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    email,
    password,
    user,
    token,
    login,
    logout,
    authenticate,
    setUser,
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
