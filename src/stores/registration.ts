import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { AuthenticationResponse } from '@types'
import { useAuthStore } from './auth'
import { useModalStore } from './modals'
import { useApiStore } from './api'

export const useRegistrationStore = defineStore('registration', () => {
  const authStore = useAuthStore()

  const api = useApiStore()
  const { validationErrorsOf } = api
  const { inputIconStatus } = storeToRefs(api)

  // State
  const email = ref<string | null>(null)
  const password = ref<string | null>(null)
  const passwordConfirmation = ref<string | null>(null)
  const userName = ref<string | null>(null)
  const avatar = ref<File | null>(null)

  // Getters
  const isLoading = computed(() => api.isLoading('register'))

  // Actions
  async function register(): Promise<boolean> {
    const formData = new FormData()
    formData.append('email', email.value || '')
    formData.append('password', password.value || '')
    formData.append('password_confirmation', passwordConfirmation.value || '')
    formData.append('username', userName.value || '')
    if (avatar.value instanceof File) formData.append('avatar', avatar.value)

    // On failure ApiError is kept in api store, 422 errors via validationErrorsOf('register')
    const response = await api
      .post<{ data: AuthenticationResponse }>('register', 'register', formData)
      .catch(() => null)
    if (!response) {
      moveConfirmationErrors()
      return false
    }

    authStore.authenticate(response.data)
    reset()
    const modalStore = useModalStore()
    const { closeModal } = modalStore
    closeModal()
    return true
  }

  /**
   * API reports confirmation mismatch under password key.
   * Moves those messages to password_confirmation, so they render under its input
   */
  function moveConfirmationErrors() {
    const { password: passwordErrors, ...errors } = validationErrorsOf('register')
    if (!passwordErrors?.length) return

    const isConfirmation = (message: string) => message.toLowerCase().includes('confirmation')
    const confirmationErrors = passwordErrors.filter(isConfirmation)
    if (!confirmationErrors.length) return

    const remainingErrors = passwordErrors.filter((message) => !isConfirmation(message))
    if (remainingErrors.length) errors.password = remainingErrors
    errors.password_confirmation = [...(errors.password_confirmation ?? []), ...confirmationErrors]

    api.setValidationErrors('register', errors)
  }

  function reset() {
    email.value = null
    password.value = null
    passwordConfirmation.value = null
    userName.value = null
    avatar.value = null
  }

  return {
    email,
    password,
    passwordConfirmation,
    userName,
    avatar,
    isLoading,
    register,
    reset,
    validationErrorsOf,
    inputIconStatus,
  }
})
