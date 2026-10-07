import type { Seat } from './SeatMap'

// Seat collected on the map before it is held, its ticket type lives in the ticket types store
export interface SelectedSeat {
  seatId: Seat['id']
  code: Seat['code']
}
