import type { TicketTypeSlug } from './SeatHold'

export interface TicketType {
  id: number
  slug: TicketTypeSlug
  name: string
  // Multiplied by the session (adult) price to get this ticket's price
  priceRatio: number
  note: string | null
  // Refused when the film's minAge is at or above this, child tickets use 16
  blockedFromRatingAge: number | null
}
