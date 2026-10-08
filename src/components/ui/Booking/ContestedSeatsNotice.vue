<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useBookingStore } from '@/stores/booking'

// Seats lost to someone else (409 on hold or pay), API asks to tell the user which ones went, by code
const bookingStore = useBookingStore()
const { dismissContested } = bookingStore
const { contestedSeats } = storeToRefs(bookingStore)

// e.g. "Seat B4 was" / "Seats B4, B5 were"
const message = computed(() =>
  contestedSeats.value.length === 1
    ? `Seat ${contestedSeats.value[0]} was just taken by someone else.`
    : `Seats ${contestedSeats.value.join(', ')} were just taken by someone else.`,
)
</script>

<template>
  <div
    v-if="contestedSeats.length"
    role="alert"
    class="flex flex-row items-start justify-between gap-3 rounded-xl bg-card px-4 py-3"
  >
    <div class="flex flex-col gap-1">
      <span class="text-label-s text-helper-red" v-text="message" />
      <span class="text-body-s text-secondary" v-text="'Pick another seat to continue.'" />
    </div>
    <button
      type="button"
      class="cursor-pointer text-primary"
      aria-label="Dismiss"
      @click="dismissContested"
    >
      <IconLoader name="Close" class="text-[16px]" />
    </button>
  </div>
</template>
