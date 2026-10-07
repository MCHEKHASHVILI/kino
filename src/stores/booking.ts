import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Seat, SeatHold, SeatMap, Session, TicketTypeSlug } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from './api'
import { useSessionsStore } from './sessions'

// API accepts at most 3 seats per order
export const MAX_SEATS = 3

export const useBookingStore = defineStore('booking', () => {
  const api = useApiStore()
  const sessionsStore = useSessionsStore()

  // State
  // Session picked on the movie page, read by BookingModal
  const session = ref<Session | null>(null)
  const seatMap = ref<SeatMap | null>(null)
  const selectedSeatIds = ref<Seat['id'][]>([])
  const progress = ref<'seats' | 'checkout'>('seats')
  // Ticket type per selected seat, seats missing here are adult
  const seatTicketTypes = ref<Record<Seat['id'], TicketTypeSlug>>({})
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
  const isLimitReached = computed(() => selectedSeatIds.value.length >= MAX_SEATS)

  // Loaded by the movie page, so they are ready before the modal opens
  const ticketTypes = computed(() => sessionsStore.ticketTypes)
  const isHolding = computed(() => api.isLoading(`hold.${session.value?.id}`))

  // Full seat objects for the selection (code for summaries), in the order they were picked
  const selectedSeats = computed(() => {
    const seats = new Map<Seat['id'], Seat>()
    seatMap.value?.sections.forEach((section) =>
      section.rows.forEach((row) => row.seats.forEach((seat) => seats.set(seat.id, seat))),
    )
    return selectedSeatIds.value.flatMap((id) => seats.get(id) ?? [])
  })

  // Actions
  // Store outlives the modal, so a new booking starts from step 1 with nothing selected
  function selectSession(value: Session) {
    session.value = value
    selectedSeatIds.value = []
    seatTicketTypes.value = {}
    heldSeats.value = null
    contestedSeats.value = []
    progress.value = 'seats'
  }

  // Selection watcher re-holds the rest, or releases the hold when it was the last seat
  function removeSeat(seatId: Seat['id']) {
    selectedSeatIds.value = selectedSeatIds.value.filter((id) => id !== seatId)
    delete seatTicketTypes.value[seatId]
  }

  function setTicketType(seatId: Seat['id'], ticketType: TicketTypeSlug) {
    seatTicketTypes.value[seatId] = ticketType
    holdSeats()
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
    if (!selectedSeatIds.value.length) return releaseHold()

    const seats = selectedSeatIds.value.map((seatId) => ({
      seatId,
      ticketType: seatTicketTypes.value[seatId] ?? 'adult',
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
   * Drops lost seats from the selection, keeps the rest and holds them again on a fresh map
   */
  async function reconcileContested(error: { response?: { data?: unknown } }) {
    const data = error.response?.data as { contested?: string[] } | undefined
    const contested = data?.contested ?? []
    const lostIds = selectedSeats.value
      .filter((seat) => contested.includes(seat.code))
      .map((seat) => seat.id)
    const remainingIds = selectedSeatIds.value.filter((id) => !lostIds.includes(id))

    await fetchSeats()
    contestedSeats.value = contested
    // Selection watcher holds the remaining seats again
    selectedSeatIds.value = remainingIds
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
    selectedSeatIds.value =
      seatMap.value?.sections.flatMap((section) =>
        section.rows.flatMap((row) =>
          row.seats.filter((seat) => seat.isMine).map((seat) => seat.id),
        ),
      ) ?? []
  }

  // Sold never frees up, held is someone else's live hold unless it is ours
  function isBlocked(seat: Seat) {
    return seat.state === 'sold' || (seat.state === 'held' && !seat.isMine)
  }

  // Once the limit is reached only already selected seats stay clickable, so they can be dropped
  function isDisabled(seat: Seat) {
    return isBlocked(seat) || (isLimitReached.value && !selectedSeatIds.value.includes(seat.id))
  }

  // Every selection change (seat clicks, restored isMine seats, 409 reconcile) re-holds it
  watch(selectedSeatIds, holdSeats, { deep: true })

  return {
    session,
    seatMap,
    selectedSeatIds,
    progress,
    subtitle,
    isSeatMapLoading,
    isLimitReached,
    selectedSeats,
    seatTicketTypes,
    heldSeats,
    ticketTypes,
    contestedSeats,
    isHolding,
    selectSession,
    setTicketType,
    removeSeat,
    holdSeats,
    releaseHold,
    fetchSeats,
    isBlocked,
    isDisabled,
  }
})
