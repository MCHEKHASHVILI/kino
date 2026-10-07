import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Seat, TicketTypeSlug } from '@types'

// API accepts at most 3 seats per order
export const MAX_SEATS = 3

// Seats picked on the map and their ticket types, holding them is up to the booking store
export const useBookingSeatsStore = defineStore('booking.seats', () => {
  // State
  // In the order they were picked
  const selectedSeatIds = ref<Seat['id'][]>([])
  // Ticket type per selected seat, seats missing here are adult
  const seatTicketTypes = ref<Record<Seat['id'], TicketTypeSlug>>({})

  // Getters
  const isLimitReached = computed(() => selectedSeatIds.value.length >= MAX_SEATS)

  // Payload for a hold request
  const seatsWithTicketTypes = computed(() =>
    selectedSeatIds.value.map((seatId) => ({
      seatId,
      ticketType: seatTicketTypes.value[seatId] ?? ('adult' as TicketTypeSlug),
    })),
  )

  // Actions
  function select(seatIds: Seat['id'][]) {
    selectedSeatIds.value = seatIds
  }

  function removeSeat(seatId: Seat['id']) {
    selectedSeatIds.value = selectedSeatIds.value.filter((id) => id !== seatId)
    delete seatTicketTypes.value[seatId]
  }

  function setTicketType(seatId: Seat['id'], ticketType: TicketTypeSlug) {
    seatTicketTypes.value[seatId] = ticketType
  }

  function reset() {
    selectedSeatIds.value = []
    seatTicketTypes.value = {}
  }

  // Sold never frees up, held is someone else's live hold unless it is ours
  function isBlocked(seat: Seat) {
    return seat.state === 'sold' || (seat.state === 'held' && !seat.isMine)
  }

  // Once the limit is reached only already selected seats stay clickable, so they can be dropped
  function isDisabled(seat: Seat) {
    return isBlocked(seat) || (isLimitReached.value && !selectedSeatIds.value.includes(seat.id))
  }

  return {
    selectedSeatIds,
    seatTicketTypes,
    isLimitReached,
    seatsWithTicketTypes,
    select,
    removeSeat,
    setTicketType,
    reset,
    isBlocked,
    isDisabled,
  }
})
