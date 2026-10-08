import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useBookingStore } from '.'

/**
 * Countdown of the live hold. Ticks against the absolute expiresAt rather than secondsRemaining,
 * so a slow render or a throttled background tab never drifts, the next tick catches up.
 * Reaching zero hands over to the booking store's expireHold
 */
export const useBookingHoldTimerStore = defineStore('booking.holdTimer', () => {
  const bookingStore = useBookingStore()

  // State
  // Bumped every second while a hold is live, the getters read the clock through it
  const now = ref(Date.now())

  // Getters
  const expiresAt = computed(() =>
    bookingStore.heldSeats ? Date.parse(bookingStore.heldSeats.expiresAt) : null,
  )

  const secondsLeft = computed(() =>
    expiresAt.value === null ? null : Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000)),
  )

  // e.g. 07:42
  const countdown = computed(() => {
    if (secondsLeft.value === null) return ''
    const minutes = Math.floor(secondsLeft.value / 60)
    const seconds = secondsLeft.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  // Ticks only while there is a hold, a new hold (new expiresAt) restarts it
  let interval: ReturnType<typeof setInterval> | undefined
  watch(
    expiresAt,
    (value) => {
      clearInterval(interval)
      interval = undefined
      if (value === null) return
      now.value = Date.now()
      interval = setInterval(() => (now.value = Date.now()), 1000)
    },
    { immediate: true },
  )

  watch(secondsLeft, (value) => {
    if (value === 0) bookingStore.expireHold()
  })

  return {
    secondsLeft,
    countdown,
  }
})
