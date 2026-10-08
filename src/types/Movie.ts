import { type AgeRating } from './AgeRating'
import { type Gerne } from './Gerne'
import { type Format } from './Format'
export interface Movie {
  id: number
  slug: string
  title: string
  kind: 'film' | 'event'
  runtimeMinutes: number
  posterUrl: string
  backdropUrl: string
  releaseDate: string
  isComingSoon: boolean
  isFeatured: boolean
  // Signed in user asked to be told when a coming soon title gets sessions
  isNotified: boolean
  fromPrice: number
  ageRating: AgeRating
  genres: Gerne[]
  formats: Format[]
}

export interface MovieDetails extends Movie {
  synopsis: string
  director: string
  cast: string
  availableDates: string[]
}

// Featured and now playing lists carry the synopsis too
export interface MovieWithSynopsis extends Movie {
  synopsis: string
}
