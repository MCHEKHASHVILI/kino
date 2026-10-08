import type { Session } from './Session'
import type { TicketTypeSlug } from './SeatHold'

// POST /orders body, card and mobile numbers may keep their spaces, the API strips them
export interface OrderForm {
  holdId: string
  fullName: string
  email: string
  // Georgian mobile, 9 digits starting with 5
  mobileNumber: string
  cardNumber: string
  // MM/YY, not in the past
  expiry: string
  cvv: string
}

export interface OrderTicket {
  id: number
  seatCode: string
  ticketType: {
    slug: TicketTypeSlug
    name: string
  }
  price: number
}

// Paid order, the confirmation view renders from this rather than local state
export interface Order {
  id: number
  // Order code shown on the confirmation screen, e.g. KX-7QF2LD
  reference: string
  status: 'paid' | 'refunded'
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  isUpcoming: boolean
  isRefundable: boolean
  cardLastFour: string
  contact: {
    fullName: string
    email: string
    mobileNumber: string
  }
  session: Session
  tickets: OrderTicket[]
}
