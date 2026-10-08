import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Movie, MovieWithSynopsis } from '@types'
import { useApiStore } from './api'
import { useAuthStore } from './auth'

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
  const isNotifying = computed(() => (movie: Movie) => api.isLoading(`notify.${movie.slug}`))

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

  /**
   * POST /movies/{movie}/notify, subscribes the signed in user to a coming soon title.
   * Subscribing twice is a no-op that still returns 201 (API), so a double click is harmless.
   * A guest gets 401, the global handler opens the login modal.
   * There is no unsubscribe, the movie is only marked as notified wherever it is listed
   */
  async function notify(movie: Movie): Promise<boolean> {
    if (movie.isNotified || isNotifying.value(movie)) return false
    const response = await api
      .post(`notify.${movie.slug}`, `movies/${movie.slug}/notify`)
      .catch(() => null)
    if (!response) return false
    for (const list of [featured.value, nowPlaying.value, comingSoon.value]) {
      const listed = list?.find((item) => item.id === movie.id)
      if (listed) listed.isNotified = true
    }
    return true
  }

  // isNotified is per user: a list already loaded is reloaded after a login or logout
  watch(
    () => useAuthStore().token,
    () => {
      if (!comingSoon.value) return
      comingSoon.value = null
      fetchComingSoon()
    },
  )

  return {
    featured,
    nowPlaying,
    comingSoon,
    isFeaturedLoading,
    isNowPlayingLoading,
    isComingSoonLoading,
    isNotifying,
    fetchFeatured,
    fetchNowPlaying,
    fetchComingSoon,
    notify,
  }
})
