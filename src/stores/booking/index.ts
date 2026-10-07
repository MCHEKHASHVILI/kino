import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Seat, SeatHold, SeatMap, Session } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from '../api'
import { useFilterOptionsStore } from '../filterOptions'
import { useBookingSeatsStore } from './seats'

export { MAX_SEATS } from './seats'

export const useBookingStore = defineStore('booking', () => {
  const api = useApiStore()
  const filterOptionsStore = useFilterOptionsStore()
  const seatsStore = useBookingSeatsStore()

  // State
  // Session picked on the movie page, read by BookingModal
  const session = ref<Session | null>(null)
  const seatMap = ref<SeatMap | null>(null)
  const progress = ref<'seats' | 'checkout'>('seats')
  // Hold response for the current selection: seats with prices, subtotal, expiry and holdId
  const heldSeats = ref<SeatHold | null>(null)
  // Seat codes lost to someone else on the last hold attempt (409)
  const contestedSeats = ref<string[]>([])

  // Getters
  // Venue · Hall · Weekday Day Month · Time · Format · Language
  const subtitle = computed(() => {
    if (!session.value) return ''
    return [
      session.value.venue.name,
      'Hall ' + session.value.hall.name,
      new Date(session.value.date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      session.value.time,
      session.value.format.name,
      session.value.language.name,
    ].join(' · ')
  })

  const isSeatMapLoading = computed(() => api.isLoading(`seats.${session.value?.id}`))

  // Loaded when the app starts, so they are ready before the modal opens
  const ticketTypes = computed(() => filterOptionsStore.ticketTypesOptions)
  const isHolding = computed(() => api.isLoading(`hold.${session.value?.id}`))

  // Full seat objects for the selection (code for summaries), in the order they were picked
  const selectedSeats = computed(() => {
    const seats = new Map<Seat['id'], Seat>()
    seatMap.value?.sections.forEach((section) =>
      section.rows.forEach((row) => row.seats.forEach((seat) => seats.set(seat.id, seat))),
    )
    return seatsStore.selectedSeatIds.flatMap((id) => seats.get(id) ?? [])
  })

  // Actions
  // Store outlives the modal, so a new booking starts from step 1 with nothing selected
  function selectSession(value: Session) {
    session.value = value
    seatsStore.reset()
    heldSeats.value = null
    contestedSeats.value = []
    progress.value = 'seats'
  }

  // Bumped per hold request, so only the latest selection's response is applied
  let holdRequest = 0

  /**
   * Holds the current selection, a new hold replaces the previous one on the API side.
   * Empty selection releases the hold instead, POST needs at least one seat
   */
  async function holdSeats() {
    const sessionId = session.value?.id
    if (!sessionId) return
    const request = ++holdRequest
    if (!seatsStore.selectedSeatIds.length) return releaseHold()

    try {
      const response = await api.post<{ data: SeatHold }>(
        `hold.${sessionId}`,
        `sessions/${sessionId}/holds`,
        { seats: seatsStore.seatsWithTicketTypes },
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
   * Drops lost seats from the selection, keeps the rest and holds them again on a fresh map
   */
  async function reconcileContested(error: { response?: { data?: unknown } }) {
    const data = error.response?.data as { contested?: string[] } | undefined
    const contested = data?.contested ?? []
    const lostIds = selectedSeats.value
      .filter((seat) => contested.includes(seat.code))
      .map((seat) => seat.id)
    const remainingIds = seatsStore.selectedSeatIds.filter((id) => !lostIds.includes(id))

    await fetchSeats()
    contestedSeats.value = contested
    // Selection watcher holds the remaining seats again
    seatsStore.select(remainingIds)
  }

  // Seats go straight back onto the map instead of waiting for the hold to lapse
  async function releaseHold() {
    const holdId = heldSeats.value?.holdId
    heldSeats.value = null
    if (!holdId) return
    await api.destroy(`release.${holdId}`, `holds/${holdId}`).catch(() => null)
  }

  async function fetchSeats() {
    const sessionId = session.value?.id
    seatMap.value = null
    if (!sessionId) return
    const response = await api
      .get<{ data: SeatMap }>(`seats.${sessionId}`, `sessions/${sessionId}/seats`)
      .catch(() => null)
    // Session was switched again while this request was in flight
    if (sessionId !== session.value?.id) return
    seatMap.value = response?.data ?? null
    // Seats from our own live hold come back as isMine, restore them as selected
    seatsStore.select(
      seatMap.value?.sections.flatMap((section) =>
        section.rows.flatMap((row) =>
          row.seats.filter((seat) => seat.isMine).map((seat) => seat.id),
        ),
      ) ?? [],
    )
  }

  // Every selection or ticket type change (seat clicks, restored isMine seats, 409 reconcile) re-holds it
  watch(() => seatsStore.seatsWithTicketTypes, holdSeats, { deep: true })

  return {
    session,
    seatMap,
    progress,
    subtitle,
    isSeatMapLoading,
    selectedSeats,
    heldSeats,
    ticketTypes,
    contestedSeats,
    isHolding,
    selectSession,
    holdSeats,
    releaseHold,
    fetchSeats,
  }
})
