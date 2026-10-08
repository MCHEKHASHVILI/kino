import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Movie, MovieWithSynopsis } from '@types'
import { useApiStore } from './api'

// Movies in the home page's Now playing row
const NOW_PLAYING_HOME_LIMIT = 10

// Home page lists, loaded once per visit to the app and kept while browsing
export const useCatalogueStore = defineStore('catalogue', () => {
  const api = useApiStore()

  // State
  // Hero carousel, a subset of now playing so every one is bookable
  const featured = ref<MovieWithSynopsis[] | null>(null)
  // Everything on release now, alphabetical, capped for the home row
  const nowPlaying = ref<MovieWithSynopsis[] | null>(null)
  // No sessions yet, so these must not lead to seat selection (API)
  const comingSoon = ref<Movie[] | null>(null)

  // Getters
  const isFeaturedLoading = computed(() => api.isLoading('featured'))
  const isNowPlayingLoading = computed(() => api.isLoading('nowPlaying'))
  const isComingSoonLoading = computed(() => api.isLoading('comingSoon'))

  // Actions
  // A failed request leaves it empty, so a later visit tries again
  async function fetchFeatured() {
    if (featured.value?.length || isFeaturedLoading.value) return
    const response = await api
      .get<{ data: MovieWithSynopsis[] }>('featured', 'movies/featured')
      .catch(() => null)
    featured.value = response?.data ?? []
  }

  // API: pass limit for the home grid, leave it off for the full catalogue
  async function fetchNowPlaying(limit = NOW_PLAYING_HOME_LIMIT) {
    if (nowPlaying.value?.length || isNowPlayingLoading.value) return
    const response = await api
      .get<{ data: MovieWithSynopsis[] }>('nowPlaying', 'movies/now-playing', {
        params: { limit },
      })
      .catch(() => null)
    nowPlaying.value = response?.data ?? []
  }

  async function fetchComingSoon() {
    if (comingSoon.value?.length || isComingSoonLoading.value) return
    const response = await api
      .get<{ data: Movie[] }>('comingSoon', 'movies/coming-soon')
      .catch(() => null)
    comingSoon.value = response?.data ?? []
  }

  return {
    featured,
    nowPlaying,
    comingSoon,
    isFeaturedLoading,
    isNowPlayingLoading,
    isComingSoonLoading,
    fetchFeatured,
    fetchNowPlaying,
    fetchComingSoon,
  }
})
