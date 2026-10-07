import type { Format } from './Format'
import type { Venue } from './Venue'
import type { Movie } from './Movie'
import type { Language } from './Language'

export interface Session {
  id: number
  startsAt: string
  date: string
  time: string
  timeBand: 'morning' | 'afternoon' | 'evening'
  price: number
  seatsLeft: number
  isSoldOut: boolean
  hall: {
    id: number
    name: string
  }
  venue: Venue
  format: Format
  language: Language
  movie: Movie
}

export interface MovieSession {
  venue: Venue
  sessions: Session[]
}
