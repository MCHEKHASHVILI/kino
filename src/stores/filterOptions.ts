import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterOptions } from '@types'
import { useApiStore } from './api'

export const useFilterOptionsStore = defineStore('filterOptions', () => {
  const api = useApiStore()

  // State
  const filterOptions = ref<FilterOptions | null>(null)
  // First request finished and its result is stored (options or nothing on failure),
  // isFilterOptionsLoading turns false a moment before the options are assigned
  const isFilterOptionsSettled = ref(false)

  // Getters
  const isFilterOptionsLoading = computed(() => api.isLoading('filterOptions'))
  // Lists are empty and limits null until the response arrives
  const venuesOptions = computed(() => filterOptions.value?.venues ?? [])
  const formatsOptions = computed(() => filterOptions.value?.formats ?? [])
  const languagesOptions = computed(() => filterOptions.value?.languages ?? [])
  const timeBandsOptions = computed(() => filterOptions.value?.timeBands ?? [])
  const sortsOptions = computed(() => filterOptions.value?.sorts ?? [])
  // adult, student and child with their price ratios, read from the API rather than hardcoded
  const ticketTypesOptions = computed(() => filterOptions.value?.ticketTypes ?? [])
  const ageRatingsOptions = computed(() => filterOptions.value?.ageRatings ?? [])
  const maxSeatsPerOrder = computed(() => filterOptions.value?.maxSeatsPerOrder ?? null)
  const holdMinutes = computed(() => filterOptions.value?.holdMinutes ?? null)

  // Actions
  // Fetched once when the app loads and kept until the next page reload,
  // a failed request leaves it empty so a later call can retry
  async function fetchFilterOptions() {
    if (filterOptions.value || isFilterOptionsLoading.value) return
    const response = await api
      .get<{ data: FilterOptions }>('filterOptions', 'filter-options')
      .catch(() => null)
    filterOptions.value = response?.data ?? null
    isFilterOptionsSettled.value = true
  }

  return {
    filterOptions,
    isFilterOptionsLoading,
    isFilterOptionsSettled,
    venuesOptions,
    formatsOptions,
    languagesOptions,
    timeBandsOptions,
    sortsOptions,
    ticketTypesOptions,
    ageRatingsOptions,
    maxSeatsPerOrder,
    holdMinutes,
    fetchFilterOptions,
  }
})
