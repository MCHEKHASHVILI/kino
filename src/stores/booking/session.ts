import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@types'

// Session picked on the movie page, every other booking store reads it from here
export const useBookingSessionStore = defineStore('booking.session', () => {
  // State
  const session = ref<Session | null>(null)

  // Getters
  // Venue · Hall · Weekday Day Month · Time · Format · Language
  const subtitle = computed(() => {
    if (!session.value) return ''
    return [
      session.value.venue.name,
      'Hall ' + session.value.hall.name,
      new Date(session.value.date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      session.value.time,
      session.value.format.name,
      session.value.language.name,
    ].join(' · ')
  })

  // Actions
  // Booking store's selectSession also resets the rest of the booking, call that one from pages
  function setSession(value: Session | null) {
    session.value = value
  }

  return {
    session,
    subtitle,
    setSession,
  }
})
