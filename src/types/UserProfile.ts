import { type UserAuthenticationForm } from './UserAuthenticationForm'
import { type Venue } from './Venue'
export interface UserProfile {
  id: number
  username: string
  email: UserAuthenticationForm['email']
  avatar: string
  fullName: string
  mobileNumber: string
  dateOfBirth: string
  // Derived from dateOfBirth, null until the profile is complete
  age: number | null
  preferredVenue: Venue
  profileComplete: boolean
//   password: UserAuthenticationForm['password']
}