import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Movie } from '@types'

// Just what the card shows, so stored entries stay small
export type RecentMovie = Pick<
  Movie,
  'id' | 'slug' | 'title' | 'posterUrl' | 'ageRating' | 'runtimeMinutes' | 'genres'
>

const STORAGE_KEY = 'recentlyViewed'
const LIMIT = 10

function load(): RecentMovie[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    // Entries saved before genres were stored get them on the next visit to that movie
    return value.map((movie: RecentMovie) => ({ ...movie, genres: movie.genres ?? [] }))
  } catch {
    return []
  }
}

// Movies opened in this browser, newest first (no API for it), shown on the home page
export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  // State
  const movies = ref<RecentMovie[]>(load())

  // Actions
  // A movie opened again moves to the front instead of showing twice
  function add(movie: Movie) {
    const entry: RecentMovie = {
      id: movie.id,
      slug: movie.slug,
      title: movie.title,
      posterUrl: movie.posterUrl,
      ageRating: movie.ageRating,
      runtimeMinutes: movie.runtimeMinutes,
      genres: movie.genres,
    }
    movies.value = [entry, ...movies.value.filter((item) => item.id !== movie.id)].slice(0, LIMIT)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies.value))
    } catch {
      // Storage full or blocked, the list still works for this visit
    }
  }

  return {
    movies,
    add,
  }
})
