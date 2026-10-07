// adult is full price, student 75 percent, child 60 percent (blocked on 16+ titles)
export type TicketTypeSlug = 'adult' | 'child' | 'student'

export interface HeldSeat {
  seatId: number
  code: string
  ticketType: {
    slug: TicketTypeSlug
    name: string
  }
  price: number
}

export interface SeatHold {
  holdId: string
  sessionId: number
  // Countdown ticks against this absolute timestamp, not secondsRemaining
  expiresAt: string
  secondsRemaining: number
  isLive: boolean
  subtotal: number
  seats: HeldSeat[]
}
