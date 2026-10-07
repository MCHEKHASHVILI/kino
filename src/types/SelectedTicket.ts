import type { Seat } from './SeatMap'
import type { TicketTypeSlug } from './SeatHold'

// Ticket for one selected seat, price is estimated until the seats are held
export interface SelectedTicket {
  seatId: Seat['id']
  code: Seat['code']
  ticketType: TicketTypeSlug
  // Session price times the ticket type's priceRatio, rounded to 2 decimals
  price: number
}
