import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@types'

// Hall · Weekday Day Month · Time, also used alone by the checkout summary
export function sessionSchedule(session: Session) {
  return [
    'Hall ' + session.hall.name,
    new Date(session.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    session.time,
  ].join(' · ')
}

// Venue · Hall · Weekday Day Month · Time, a paid order's session on the confirmation
export function sessionVenueSchedule(session: Session) {
  return [session.venue.name, sessionSchedule(session)].join(' · ')
}

// Venue · Hall · Weekday Day Month · Time · Format · Language
export function sessionSubtitle(session: Session) {
  return [sessionVenueSchedule(session), session.format.name, session.language.name].join(' · ')
}

// Session picked on the movie page, every other booking store reads it from here
export const useBookingSessionStore = defineStore('booking.session', () => {
  // State
  const session = ref<Session | null>(null)

  // Getters
  const schedule = computed(() => (session.value ? sessionSchedule(session.value) : ''))

  const subtitle = computed(() => (session.value ? sessionSubtitle(session.value) : ''))

  // Actions
  // Booking store's selectSession also resets the rest of the booking, call that one from pages
  function setSession(value: Session | null) {
    session.value = value
  }

  return {
    session,
    schedule,
    subtitle,
    setSession,
  }
})
