import type { AgeRating } from './AgeRating'
import type { Format } from './Format'
import type { Language } from './Language'
import type { TicketType } from './TicketType'
import type { Venue } from './Venue'

// GET /filter-options, source of truth for every list the sessions sidebar and booking modal render
export interface FilterOptions {
  venues: Venue[]
  formats: Format[]
  languages: Language[]
  timeBands: { id: string; label: string }[]
  sorts: { id: string; label: string }[]
  ticketTypes: TicketType[]
  ageRatings: AgeRating[]
  maxSeatsPerOrder: number
  holdMinutes: number
}
