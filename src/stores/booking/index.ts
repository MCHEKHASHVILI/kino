import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Movie, MovieSessionItem, SeatHold, SeatMap, Session } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from '../api'
import { useAuthStore } from '../auth'
import { useModalStore } from '../modals'
import { useBookingSeatsStore } from './seats'
import { useBookingSessionStore } from './session'
import { useBookingTicketTypesStore } from './ticketTypes'

// Live hold id survives a page reload here, restoreHold reads it back on app start
const HOLD_STORAGE_KEY = 'holdId'

export const useBookingStore = defineStore('booking', () => {
  const api = useApiStore()
  const sessionStore = useBookingSessionStore()
  const seatsStore = useBookingSeatsStore()
  const ticketTypesStore = useBookingTicketTypesStore()

  // State
  const seatMap = ref<SeatMap | null>(null)
  const progress = ref<'seats' | 'checkout'>('seats')
  // Hold response for the current selection: seats with prices, subtotal, expiry and holdId
  const heldSeats = ref<SeatHold | null>(null)
  // Seat codes lost to someone else on the last hold attempt (409)
  const contestedSeats = ref<string[]>([])

  // Getters
  const isSeatMapLoading = computed(() => api.isLoading(`seats.${sessionStore.session?.id}`))

  const isHolding = computed(() => api.isLoading(`hold.${sessionStore.session?.id}`))

  // Estimate before holding, the hold returns the real total
  const subtotal = computed(
    () =>
      Math.round(
        ticketTypesStore.selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0) * 100,
      ) / 100,
  )

  // Actions
  // Store outlives the modal, so a new booking starts from step 1 with nothing selected.
  // Movie page sessions come without their movie, it is attached here so the age rating is known
  function selectSession(value: MovieSessionItem, movie: Movie) {
    // Previous booking's seats go back onto the map, not awaited so the modal opens right away
    if (heldSeats.value) releaseHold()
    sessionStore.setSession({ ...value, movie })
    seatsStore.reset()
    contestedSeats.value = []
    progress.value = 'seats'
  }

  // Bumped per hold request, so only the latest response is applied
  let holdRequest = 0

  /**
   * Holds the collected seats once the user is done picking, called explicitly rather than per click.
   * A new hold replaces the previous one on the API side.
   * Empty selection releases the hold instead, POST needs at least one seat
   */
  async function holdSeats() {
    const sessionId = sessionStore.session?.id
    if (!sessionId) return
    const request = ++holdRequest
    if (!seatsStore.selectedSeats.length) return releaseHold()

    const seats = ticketTypesStore.selectedTickets.map(({ seatId, ticketType }) => ({
      seatId,
      ticketType,
    }))
    try {
      const response = await api.post<{ data: SeatHold }>(
        `hold.${sessionId}`,
        `sessions/${sessionId}/holds`,
        { seats },
      )
      if (request !== holdRequest) return
      heldSeats.value = response.data
    } catch (error) {
      if (request !== holdRequest) return
      // Nothing is held after a failure, previous hold is released so the stored id goes with it
      await releaseHold()
      if (isApiError(error) && error.status === 409) await reconcileContested(error.original)
    }
  }

  /**
   * Someone took seats between drawing the map and holding them.
   * A fresh map drops the lost seats from the selection, the user reviews the rest and holds again
   */
  async function reconcileContested(error: { response?: { data?: unknown } }) {
    const data = error.response?.data as { contested?: string[] } | undefined
    await fetchSeats()
    contestedSeats.value = data?.contested ?? []
  }

  // Next checkout: holds the collected seats, the step only changes once the hold succeeded
  async function proceedToCheckout() {
    if (!seatsStore.selectedSeats.length) return
    await holdSeats()
    if (heldSeats.value) progress.value = 'checkout'
  }

  /**
   * Seats go straight back onto the map instead of waiting for the hold to lapse.
   * Backend is told first (DELETE holds/{hold}), only then the stored id is forgotten.
   * Cleanup runs in the background, so global handlers are skipped (a 404 must not redirect)
   */
  async function releaseHold(
    holdId = heldSeats.value?.holdId ?? localStorage.getItem(HOLD_STORAGE_KEY),
  ) {
    heldSeats.value = null
    if (!holdId) return
    await api
      .destroy(`release.${holdId}`, `holds/${holdId}`, { skipErrorHandler: true })
      .catch(() => null)
    // A newer hold may have been stored while the request was in flight, keep that one
    if (localStorage.getItem(HOLD_STORAGE_KEY) === holdId) {
      localStorage.removeItem(HOLD_STORAGE_KEY)
    }
  }

  /**
   * Brings back a hold after a page reload: the hold, its session (with movie) and the selection,
   * then reopens the booking modal on checkout.
   * Expired hold (isLive false) is released on the API before its id is forgotten.
   * Missing (404) or not ours (401, 403) can't be released, so the id is only forgotten,
   * global handlers are skipped so a background restore never redirects or logs the user out
   */
  async function restoreHold() {
    const holdId = localStorage.getItem(HOLD_STORAGE_KEY)
    if (!holdId) return
    // DELETE needs the token too, a logged out user's hold just lapses
    if (!useAuthStore().isAuthenticated) return localStorage.removeItem(HOLD_STORAGE_KEY)

    const skipErrorHandler = [401, 403, 404] as const
    const forgetOnRejection = (error: unknown) => {
      if (isApiError(error) && skipErrorHandler.some((status) => status === error.status)) {
        localStorage.removeItem(HOLD_STORAGE_KEY)
      }
      return null
    }

    const hold = await api
      .get<{ data: SeatHold }>(`restoreHold.${holdId}`, `holds/${holdId}`, {
        skipErrorHandler: [...skipErrorHandler],
      })
      .then((response) => response.data)
      .catch(forgetOnRejection)
    if (!hold) return
    if (!hold.isLive) return releaseHold(hold.holdId)

    const session = await api
      .get<{ data: Session }>(`session.${hold.sessionId}`, `sessions/${hold.sessionId}`, {
        skipErrorHandler: [...skipErrorHandler],
      })
      .then((response) => response.data)
      .catch(forgetOnRejection)
    if (!session) return

    sessionStore.setSession(session)
    contestedSeats.value = []
    // Seats first, the ticket types store drops types of seats that are not selected
    seatsStore.setSeats(hold.seats.map(({ seatId, code }) => ({ seatId, code })))
    hold.seats.forEach((seat) => ticketTypesStore.setTicketType(seat.seatId, seat.ticketType.slug))
    heldSeats.value = hold
    progress.value = 'checkout'
    useModalStore().openModal('BookingModal')
  }

  async function fetchSeats() {
    const sessionId = sessionStore.session?.id
    seatMap.value = null
    if (!sessionId) return
    const response = await api
      .get<{ data: SeatMap }>(`seats.${sessionId}`, `sessions/${sessionId}/seats`)
      .catch(() => null)
    // Session was switched again while this request was in flight
    if (sessionId !== sessionStore.session?.id) return
    seatMap.value = response?.data ?? null
    if (!seatMap.value) return
    seatsStore.syncWithMap(
      seatMap.value.sections.flatMap((section) => section.rows.flatMap((row) => row.seats)),
    )
  }

  // Stores the live hold id so restoreHold can bring it back after a reload,
  // removing it is left to releaseHold, which tells the backend first
  watch(heldSeats, (hold) => {
    if (hold) localStorage.setItem(HOLD_STORAGE_KEY, hold.holdId)
  })

  return {
    seatMap,
    progress,
    isSeatMapLoading,
    heldSeats,
    contestedSeats,
    isHolding,
    subtotal,
    selectSession,
    holdSeats,
    proceedToCheckout,
    releaseHold,
    restoreHold,
    fetchSeats,
  }
})
