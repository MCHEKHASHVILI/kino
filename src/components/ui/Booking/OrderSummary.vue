<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookingStore } from '@/stores/booking'
import { useBookingSessionStore } from '@/stores/booking/session'
import { countTicketTypes } from '@/stores/booking/ticketTypes'

const { session, schedule } = storeToRefs(useBookingSessionStore())
const { heldSeats } = storeToRefs(useBookingStore())

// Read from the hold, so the summary shows what the API actually holds
const seatCodes = computed(() => heldSeats.value?.seats.map((seat) => seat.code).join(', ') ?? '')

// Tickets counted per type in hold order, e.g. ['2 × Adult', '1 × Child']
const ticketCounts = computed(() =>
  countTicketTypes(heldSeats.value?.seats.map(({ ticketType }) => ticketType.name) ?? []),
)
</script>

<template>
  <div class="flex w-full flex-col gap-4 rounded-2xl bg-card p-3.75">
    <div class="flex flex-col gap-1">
      <span class="text-button text-primary" v-text="session?.movie.title ?? ''" />
      <span class="text-body-s text-secondary" v-text="schedule" />
    </div>
    <!-- divider -->
    <div class="relative flex h-px w-full items-center bg-raised"></div>
    <div class="flex flex-col gap-3">
      <div class="flex flex-row items-start justify-between gap-3">
        <span class="text-body-s text-secondary capitalize" v-text="'seats'" />
        <span class="text-right text-label-s text-primary" v-text="seatCodes" />
      </div>
      <div class="flex flex-row items-start justify-between gap-3">
        <span class="text-body-s text-secondary capitalize" v-text="'tickets'" />
        <div class="flex flex-col items-end">
          <span
            v-for="line in ticketCounts"
            :key="line"
            class="text-label-s text-primary"
            v-text="line"
          />
        </div>
      </div>
    </div>
  </div>
</template>
