import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MovieWithSynopsis } from '@types'
import { useApiStore } from './api'

// Home page lists, loaded once per visit to the app and kept while browsing
export const useCatalogueStore = defineStore('catalogue', () => {
  const api = useApiStore()

  // State
  // Hero carousel, a subset of now playing so every one is bookable
  const featured = ref<MovieWithSynopsis[] | null>(null)

  // Getters
  const isFeaturedLoading = computed(() => api.isLoading('featured'))

  // Actions
  // A failed request leaves it empty, so a later visit tries again
  async function fetchFeatured() {
    if (featured.value?.length || isFeaturedLoading.value) return
    const response = await api
      .get<{ data: MovieWithSynopsis[] }>('featured', 'movies/featured')
      .catch(() => null)
    featured.value = response?.data ?? []
  }

  return {
    featured,
    isFeaturedLoading,
    fetchFeatured,
  }
})
