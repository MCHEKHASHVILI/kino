import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Seat, SelectedTicket, TicketTypeSlug } from '@types'
import { useFilterOptionsStore } from '../filterOptions'
import { useBookingSeatsStore } from './seats'
import { useBookingSessionStore } from './session'

const DEFAULT_TICKET_TYPE: TicketTypeSlug = 'adult'

// Ticket type picked for each selected seat, seats without a pick are adult
export const useBookingTicketTypesStore = defineStore('booking.ticketTypes', () => {
  const filterOptionsStore = useFilterOptionsStore()
  const sessionStore = useBookingSessionStore()
  // Seats store uses this store too, fine as long as neither is read during setup
  const seatsStore = useBookingSeatsStore()

  // State
  const seatTicketTypes = ref<Record<Seat['id'], TicketTypeSlug>>({})

  // Getters
  // Loaded when the app starts, so they are ready before the modal opens.
  // Cheapest first (child, student, adult), copied so the shared filter options keep the API order
  const ticketTypes = computed(() =>
    [...filterOptionsStore.ticketTypesOptions].sort((a, b) => a.priceRatio - b.priceRatio),
  )

  // Minimum age of the session's film, 0 (no restriction) while unknown
  const sessionMinAge = computed(
    () => Number.parseInt(sessionStore.session?.movie?.ageRating?.minAge ?? '', 10) || 0,
  )

  // One ticket per selected seat in pick order, priced from the session (adult) price
  const selectedTickets = computed<SelectedTicket[]>(() => {
    const sessionPrice = sessionStore.session?.price ?? 0
    return seatsStore.selectedSeats.map(({ seatId, code }) => {
      const ticketType = ticketTypeOf(seatId)
      return {
        seatId,
        code,
        ticketType,
        price: Math.round(sessionPrice * priceRatioOf(ticketType) * 100) / 100,
      }
    })
  })

  // Actions
  function ticketTypeOf(seatId: Seat['id']) {
    return seatTicketTypes.value[seatId] ?? DEFAULT_TICKET_TYPE
  }

  // Multiplied by the session (adult) price, unknown types are full price
  function priceRatioOf(ticketType: TicketTypeSlug) {
    return ticketTypes.value.find((type) => type.slug === ticketType)?.priceRatio ?? 1
  }

  // Refused when the film's minAge is at or above the type's blockedFromRatingAge (child on 16+)
  function isTicketTypeAllowed(ticketType: TicketTypeSlug) {
    const blockedFrom = ticketTypes.value.find(
      (type) => type.slug === ticketType,
    )?.blockedFromRatingAge
    return blockedFrom == null || sessionMinAge.value < blockedFrom
  }

  // Blocked types are ignored, so the hold never carries a ticket the API refuses
  function setTicketType(seatId: Seat['id'], ticketType: TicketTypeSlug) {
    if (!isTicketTypeAllowed(ticketType)) return
    seatTicketTypes.value[seatId] = ticketType
  }

  // Dropped seat starts as adult again if it is picked later
  function clearTicketType(seatId: Seat['id']) {
    delete seatTicketTypes.value[seatId]
  }

  function reset() {
    seatTicketTypes.value = {}
  }

  return {
    seatTicketTypes,
    ticketTypes,
    selectedTickets,
    ticketTypeOf,
    priceRatioOf,
    isTicketTypeAllowed,
    setTicketType,
    clearTicketType,
    reset,
  }
})
