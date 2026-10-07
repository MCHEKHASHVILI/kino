import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile, Venue } from '@types'
import { useApiStore } from './api'
import { useAuthStore } from './auth'

// Profile page tabs, selected by ?tab= query param
export const PROFILE_TABS = ['personal', 'tickets'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()
  const api = useApiStore()
  const { validationErrorsOf } = api
  const { inputIconStatus } = storeToRefs(api)

  // State
  const fullName = ref<string | null>(null)
  const mobileNumber = ref<string | null>(null)
  const dateOfBirth = ref<string | null>(null)
  const preferredVenueId = ref<Venue['id'] | null>(null)
  const venues = ref<Venue[]>([])

  // Getters
  // Email is set at registration and can't be changed, shown read only
  const email = computed(() => authStore.user?.email ?? '')
  const isLoading = computed(() => api.isLoading('profile'))

  // Actions
  // Form starts from the signed in user, so unsaved edits are dropped when the page is reopened
  function fill(user: UserProfile | null = authStore.user) {
    fullName.value = user?.fullName ?? null
    mobileNumber.value = user?.mobileNumber ?? null
    dateOfBirth.value = user?.dateOfBirth ?? null
    preferredVenueId.value = user?.preferredVenue?.id ?? null
  }

  // Venues rarely change, loaded once and kept for the rest of the visit
  async function fetchVenues() {
    if (venues.value.length) return
    const response = await api
      .get<{ data: { venues: Venue[] } }>('venues', 'filter-options')
      .catch(() => null)
    venues.value = response?.data.venues ?? []
  }

  async function updateProfile(): Promise<boolean> {
    // Sent as JSON, multipart is only needed for avatar which this form doesn't edit
    const response = await api
      .put<{ data: UserProfile }>('profile', 'profile', {
        fullName: fullName.value,
        mobileNumber: mobileNumber.value,
        dateOfBirth: dateOfBirth.value,
        preferredVenueId: preferredVenueId.value,
      })
      .catch(() => null)
    if (!response) return false

    authStore.setUser(response.data)
    fill(response.data)
    return true
  }

  return {
    fullName,
    mobileNumber,
    dateOfBirth,
    preferredVenueId,
    venues,
    email,
    isLoading,
    fill,
    fetchVenues,
    updateProfile,
    validationErrorsOf,
    inputIconStatus,
  }
})
