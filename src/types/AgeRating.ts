export interface AgeRating {
  code: 'G' | 'PG' | '12+' | '16+' | '18+'
  // Compared with the signed in user's age
  minAge: number
  description: string
}
