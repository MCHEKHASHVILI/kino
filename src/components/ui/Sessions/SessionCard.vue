<script setup lang="ts">
import { computed } from 'vue'
import type { Movie, MovieSessionItem } from '@types'
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useBookingStore } from '@/stores/booking'

// Sessions page card: time and format, language and where, seats left and price.
// Clicking starts booking for this session, the movie is attached like on the movie page
const props = defineProps<{ session: MovieSessionItem; movie: Movie }>()

const { selectSession } = useBookingStore()

// Few seats left (3 or fewer) is a warning
const seatsColor = computed(() =>
  props.session.seatsLeft > 3 ? 'text-helper-green' : 'text-helper-red',
)

const seatsText = computed(() =>
  props.session.isSoldOut
    ? 'Sold out'
    : `${props.session.seatsLeft} ${props.session.seatsLeft === 1 ? 'seat' : 'seats'} left`,
)
</script>

<template>
  <!-- Sold out stays visible but is not a link (API: disabled rather than hidden) -->
  <component
    :is="session.isSoldOut ? 'div' : AppLink"
    v-bind="
      session.isSoldOut
        ? { 'aria-disabled': true }
        : { to: { name: 'action.modal', params: { name: 'BookingModal' } } }
    "
    class="flex w-63 flex-col justify-between gap-3 rounded-2xl bg-card p-3.75"
    :class="session.isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'"
    @click="!session.isSoldOut && selectSession(props.session, props.movie)"
  >
    <div class="flex flex-row items-center justify-between">
      <span class="text-h3 text-primary" v-text="session.time" />
      <span
        class="rounded-full bg-raised px-1.25 py-2.5 text-label-s text-primary uppercase"
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
