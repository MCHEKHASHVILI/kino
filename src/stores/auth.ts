import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/api/http'
import type { UserAuthenticationForm, UserProfile } from '@types'
import { useModalStore } from './modals'

export const useAuthStore = defineStore('auth', () => {
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
  // Actions
  async function login(): Promise<void> {
    const credentials: UserAuthenticationForm = {
      email: email.value,
      password: password.value,
    }
    const response = await http.post('login', credentials)
    if (!response.status || response.status !== 200) {
      // Show Error Messages

      return
    }
    const { data } = response.data
    authenticate(data)
    const modalStore = useModalStore()
    const { closeModal } = modalStore
    closeModal()
  }

  function authenticate(data: { user: UserProfile; token: string }) {
    user.value = data.user
    token.value = data.token

    // Persist to local storage to maintain session on refresh
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
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
    isAuthorized,
    isAuthenticated,
    initials,
    firstName,
    isProfileComplete,
    avatar,
    fullName,
  }
})
