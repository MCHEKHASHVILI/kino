import { type UserProfile } from './UserProfile'
export interface AuthenticationResponse {
  user: UserProfile
  token: string
}
