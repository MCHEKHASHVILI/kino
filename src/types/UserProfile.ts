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
  age: number
  preferredVenue: Venue
  profileComplete: boolean
//   password: UserAuthenticationForm['password']
}