import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterOptions } from '@types'
import { useApiStore } from './api'

export const useSessionsStore = defineStore('sessions', () => {
  const api = useApiStore()

  // State
  const filterOptions = ref<FilterOptions | null>(null)

  // Getters
  const isFilterOptionsLoading = computed(() => api.isLoading('filterOptions'))
  // adult, student and child with their price ratios, read from the API rather than hardcoded
  const ticketTypes = computed(() => filterOptions.value?.ticketTypes ?? [])

  // Actions
  // Options rarely change, loaded once and kept for the rest of the visit
  async function fetchFilterOptions() {
    if (filterOptions.value || isFilterOptionsLoading.value) return
    const response = await api
      .get<{ data: FilterOptions }>('filterOptions', 'filter-options')
      .catch(() => null)
    filterOptions.value = response?.data ?? null
  }

  return {
    filterOptions,
    isFilterOptionsLoading,
    ticketTypes,
    fetchFilterOptions,
  }
})
