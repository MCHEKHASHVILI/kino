import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { MovieDetails, MovieSession, MovieSessionItem } from '@types'
import { useApiStore } from './api'

export const useMovieStore = defineStore('movie', () => {
  const api = useApiStore()

  // State
  const slug = ref<string | null>(null)
  const movie = ref<MovieDetails | null>(null)
  const sessionDate = ref<string | null>(null)
  const movieSessions = ref<MovieSession[] | null>(null)

  // Getters
  // Keyed off request state, not null data, so failed requests or movies without dates don't pulse forever
  const isMovieLoading = computed(() => api.isLoading(`movie.${slug.value}`))
  const isSessionsLoading = computed(
    () => isMovieLoading.value || api.isLoading(`sessions.${slug.value}`),
  )

  // Actions
  // Opens on preferredDate (e.g. the session picked on the sessions page) when the movie plays
  // that day, otherwise on its first available date
  async function fetchMovie(movieSlug: string, preferredDate?: string | null) {
    slug.value = movieSlug
    movie.value = null
    // Previous movie's sessions must not stay on screen (dimmed) for the new one
    movieSessions.value = null
    sessionDate.value = null
    const response = await api
      .get<{ data: MovieDetails }>(`movie.${movieSlug}`, `movies/${movieSlug}`)
      .catch(() => null)
    // Slug was switched again while this request was in flight
    if (!response || movieSlug !== slug.value) return

    movie.value = response.data
    selectDate(preferredDate)
  }

  // A day the movie plays on, the first available one when the date is missing or unknown
  function selectDate(date?: string | null) {
    const availableDates = movie.value?.availableDates ?? []
    sessionDate.value = date && availableDates.includes(date) ? date : (availableDates[0] ?? null)
  }

  // Old sessions are kept (dimmed) while the new date loads, instead of falling back to the skeleton
  async function fetchMovieSessions(date: string | null) {
    const movieSlug = slug.value
    if (!date || !movieSlug) return
    const response = await api
      .get<{ data: MovieSession[] }>(`sessions.${movieSlug}`, `movies/${movieSlug}/sessions`, {
        params: { date },
      })
      .catch(() => null)
    // Date or movie was switched again while this request was in flight, a newer response owns the list
    if (date !== sessionDate.value || movieSlug !== slug.value) return
    // On failure drop the old list, it belongs to a different date
    movieSessions.value = response?.data ?? null
  }

  // Several sessions can share a hall, group them so each hall renders once with its sessions
  function groupVenueSessionsByHalls(sessions: MovieSessionItem[]) {
    const halls = sessions.reduce((accumulator, session) => {
      const group = accumulator.get(session.hall.id)
      if (group) group.sessions.push(session)
      else accumulator.set(session.hall.id, { hall: session.hall, sessions: [session] })
      return accumulator
    }, new Map<number, { hall: MovieSessionItem['hall']; sessions: MovieSessionItem[] }>())

    return [...halls.values()]
  }

  watch(sessionDate, (date) => fetchMovieSessions(date))

  return {
    slug,
    movie,
    sessionDate,
    movieSessions,
    isMovieLoading,
    isSessionsLoading,
    fetchMovie,
    selectDate,
    fetchMovieSessions,
    groupVenueSessionsByHalls,
  }
})
