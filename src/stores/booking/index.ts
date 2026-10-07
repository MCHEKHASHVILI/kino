import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SeatHold, SeatMap, Session } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from '../api'
import { useBookingSeatsStore } from './seats'
import { useBookingSessionStore } from './session'
import { useBookingTicketTypesStore } from './ticketTypes'

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
  // Store outlives the modal, so a new booking starts from step 1 with nothing selected
  function selectSession(value: Session) {
    sessionStore.setSession(value)
    seatsStore.reset()
    heldSeats.value = null
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
      // Nothing is held after a failure, previous hold was replaced or never existed
      heldSeats.value = null
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

  // Seats go straight back onto the map instead of waiting for the hold to lapse
  async function releaseHold() {
    const holdId = heldSeats.value?.holdId
    heldSeats.value = null
    if (!holdId) return
    await api.destroy(`release.${holdId}`, `holds/${holdId}`).catch(() => null)
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
    releaseHold,
    fetchSeats,
  }
})
