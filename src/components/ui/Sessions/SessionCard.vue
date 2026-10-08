<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import type { Movie, MovieSessionItem } from '@types'
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modals'

// Sessions page card: time and format, language and where, seats left and price.
// Clicking goes to the movie page and opens booking for this session there
const props = defineProps<{ session: MovieSessionItem; movie: Movie }>()

const { selectSession } = useBookingStore()
const router = useRouter()
const modalStore = useModalStore()
const { user } = storeToRefs(useAuthStore())

// Re-checked every 30s, a session that starts while the page is open gets disabled
const now = ref(Date.now())
useIntervalFn(() => (now.value = Date.now()), 30_000)

const hasStarted = computed(() => Date.parse(props.session.startsAt) <= now.value)

// API: compare the signed in user's age (null until the profile is complete) with minAge.
// Guests and incomplete profiles are not blocked here, the booking flow handles them
const isTooYoung = computed(() => {
  const age = user.value?.age
  return typeof age === 'number' && age < props.movie.ageRating.minAge
})

// Disabled cards stay visible (API: disabled rather than hidden) but can't start a booking
const disabledReason = computed(() => {
  if (props.session.isSoldOut) return 'Sold out'
  if (hasStarted.value) return 'This session has already started'
  if (isTooYoung.value) return `This film is rated ${props.movie.ageRating.code}`
  return null
})
const isDisabled = computed(() => disabledReason.value !== null)

const movieRoute = computed(() => ({ name: 'movie', params: { slug: props.movie.slug } }))

/**
 * Picks the session, opens the movie page, then the booking modal on top of it.
 * The modal opens only after the navigation, which closes any open modal on its way.
 * A modified click (new tab, middle click) is left to the browser, the link just opens the movie
 */
async function book(event: MouseEvent) {
  if (isDisabled.value || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
    return
  event.preventDefault()
  selectSession(props.session, props.movie)
  await router.push(movieRoute.value)
  modalStore.openModal('BookingModal')
}

// Sold out is neutral, few seats left (3 or fewer) is a warning
const seatsColor = computed(() => {
  if (props.session.isSoldOut) return 'text-secondary'
  return props.session.seatsLeft > 3 ? 'text-helper-green' : 'text-helper-red'
})

const seatsText = computed(() =>
  props.session.isSoldOut
    ? 'Sold out'
    : `${props.session.seatsLeft} ${props.session.seatsLeft === 1 ? 'seat' : 'seats'} left`,
)
</script>

<template>
  <!-- Disabled (sold out, started, too young): 40% opacity, not a link, the reason as tooltip -->
  <component
    :is="isDisabled ? 'div' : AppLink"
    v-bind="isDisabled ? { 'aria-disabled': true, title: disabledReason } : { to: movieRoute }"
    class="flex w-63 shrink-0 flex-col justify-between gap-3 rounded-2xl bg-card p-3.75"
    :class="isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
    @click="book"
  >
    <div class="flex flex-row items-center justify-between">
      <span class="text-h3 text-primary" v-text="session.time" />
      <span
        class="rounded-full bg-raised px-2.5 py-1.25 text-label-s text-primary uppercase"
        v-text="session.format.name"
      />
    </div>
    <div class="flex flex-row justify-between gap-2">
      <div class="flex flex-col items-start justify-between gap-2.5">
        <span class="text-body-s text-secondary" v-text="session.language.name" />
        <span
          class="text-label-s text-nowrap text-primary"
          v-text="session.venue.name + ' · Hall ' + session.hall.name"
        />
      </div>
      <div class="flex flex-col items-end justify-between gap-2.5">
        <div class="flex flex-row items-center justify-end gap-1 text-body-s" :class="seatsColor">
          <IconLoader name="Ticket" />
          <span class="text-nowrap" v-text="seatsText" />
        </div>
        <span class="text-button text-primary" v-text="'₾' + session.price" />
      </div>
    </div>
  </component>
</template>
