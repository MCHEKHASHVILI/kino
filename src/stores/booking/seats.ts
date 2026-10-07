import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Seat, SelectedSeat } from '@types'
import { useFilterOptionsStore } from '../filterOptions'

// Seats collected on the map, nothing is sent until the booking store holds them.
// Knows nothing about ticket types, the ticket types store follows this selection
export const useBookingSeatsStore = defineStore('booking.seats', () => {
  const filterOptionsStore = useFilterOptionsStore()

  // State
  // In the order they were picked
  const selectedSeats = ref<SelectedSeat[]>([])

  // Getters
  // Seats per order allowed by the API, null until filter options load
  const maxSeats = computed(() => filterOptionsStore.maxSeatsPerOrder)
  // Unknown limit counts as reached, so nothing is picked that the API might refuse
  const isLimitReached = computed(
    () => maxSeats.value === null || selectedSeats.value.length >= maxSeats.value,
  )

  // Actions
  function isSelected(seatId: Seat['id']) {
    return selectedSeats.value.some((selected) => selected.seatId === seatId)
  }

  function addSeat(seat: Seat) {
    if (isSelected(seat.id) || isDisabled(seat)) return
    selectedSeats.value.push({ seatId: seat.id, code: seat.code })
  }

  function removeSeat(seatId: Seat['id']) {
    selectedSeats.value = selectedSeats.value.filter((selected) => selected.seatId !== seatId)
  }

  // Seat map click: picks a free seat or drops an already picked one
  function toggleSeat(seat: Seat) {
    if (isSelected(seat.id)) removeSeat(seat.id)
    else addSeat(seat)
  }

  /**
   * Lines the selection up with a freshly fetched map: drops seats someone else took meanwhile
   * and adds seats from our own live hold (isMine), e.g. after a reload
   */
  function syncWithMap(seats: Seat[]) {
    const kept = selectedSeats.value.filter((selected) =>
      seats.some((seat) => seat.id === selected.seatId && !isBlocked(seat)),
    )
    const mine = seats
      .filter((seat) => seat.isMine && !kept.some((selected) => selected.seatId === seat.id))
      .map((seat) => ({ seatId: seat.id, code: seat.code }))
    selectedSeats.value = [...kept, ...mine]
  }

  function reset() {
    selectedSeats.value = []
  }

  // Sold never frees up, held is someone else's live hold unless it is ours
  function isBlocked(seat: Seat) {
    return seat.state === 'sold' || (seat.state === 'held' && !seat.isMine)
  }

  // Once the limit is reached only already selected seats stay clickable, so they can be dropped
  function isDisabled(seat: Seat) {
    return isBlocked(seat) || (isLimitReached.value && !isSelected(seat.id))
  }

  return {
    selectedSeats,
    maxSeats,
    isLimitReached,
    isSelected,
    addSeat,
    removeSeat,
    toggleSeat,
    syncWithMap,
    reset,
    isBlocked,
    isDisabled,
  }
})
