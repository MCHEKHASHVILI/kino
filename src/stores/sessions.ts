import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionsGroup, SessionsMeta, SessionsParams } from '@types'
import { useApiStore } from './api'

// Sessions page: every showing on one date, grouped by film and paged by film
export const useSessionsStore = defineStore('sessions', () => {
  const api = useApiStore()

  // State
  const groups = ref<SessionsGroup[] | null>(null)
  const meta = ref<SessionsMeta | null>(null)

  // Getters
  const isLoading = computed(() => api.isLoading('sessions'))

  // Actions
  // Bumped per request, so a slow earlier page can't overwrite a newer one
  let request = 0

  // Arrays go out as venues[]=a&venues[]=b, axios' default for array params
  async function fetchSessions(params: SessionsParams) {
    const current = ++request
    const response = await api
      .get<{ data: SessionsGroup[]; meta: SessionsMeta }>('sessions', 'sessions', { params })
      .catch(() => null)
    if (current !== request) return
    groups.value = response?.data ?? []
    meta.value = response?.meta ?? null
  }

  return {
    groups,
    meta,
    isLoading,
    fetchSessions,
  }
})
