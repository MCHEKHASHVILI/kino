<script setup lang="ts">
import type { Movie, MovieSessionItem } from '@types'
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useBookingStore } from '@/stores/booking'

// Session card shared by the movie and sessions pages, the movie is attached when booking starts
const props = defineProps<{ session: MovieSessionItem; movie: Movie }>()

const { selectSession } = useBookingStore()
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
    class="badge-ticket"
    @click="!session.isSoldOut && selectSession(props.session, props.movie)"
  >
    <!-- Left: time + tags -->
    <div class="flex w-31 flex-col items-center justify-center gap-2 py-3.75">
      <span class="text-h2 text-primary" v-text="session.time" />
      <div class="flex items-center gap-1.5">
        <span class="text-body-s text-secondary uppercase" v-text="session.language.code" />
        <span class="badge-default uppercase" v-text="session.format.name" />
      </div>
    </div>
    <!-- Divider with notches, the notches take the card's background -->
    <div
      class="relative my-2 w-px bg-[linear-gradient(to_bottom,currentColor_3px,transparent_3px)] bg-size-[1px_7px] bg-center bg-repeat-y text-primary"
    >
      <span class="absolute -top-3.25 left-[-5.6px] h-3 w-3 rounded-full bg-card"></span>
      <span class="absolute -bottom-3.25 left-[-5.6px] h-3 w-3 rounded-full bg-card"></span>
    </div>

    <!-- Right: price + seats -->
    <div
      v-if="!session.isSoldOut"
      class="flex w-20.75 flex-col items-center justify-center gap-2 px-2.5 py-3.75"
    >
      <span class="text-h3 text-helper-red" v-text="'₾ ' + session.price" />
      <div class="flex flex-row items-baseline justify-center gap-1">
        <IconLoader name="Ticket" class="text-body-s text-secondary" />
        <span class="text-body-s text-secondary" v-text="session.seatsLeft + ' left'" />
      </div>
    </div>
    <div v-else class="flex w-20.75 flex-col items-center justify-center gap-2 px-2.5 py-3.75">
      <IconLoader name="Error" class="text-h3 text-helper-red" />
      <span class="badge-red text-nowrap" v-text="'Sold out'" />
    </div>
  </component>
</template>
