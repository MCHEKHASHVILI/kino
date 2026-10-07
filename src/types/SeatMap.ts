import type { Venue } from './Venue'

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable'

export interface Seat {
  id: number
  code: string
  label: string
  state: SeatState
  aisleAfter: boolean
  isMine: boolean
}

export interface SeatRow {
  label: string
  seats: Seat[]
}

export interface SeatSection {
  name: string
  rows: SeatRow[]
}

export interface SeatMap {
  sessionId: number
  hall: {
    id: number
    name: string
    venue: Venue
  }
  sections: SeatSection[]
}
