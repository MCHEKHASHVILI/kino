<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Order } from '@types'
import { useTicketsStore } from '@/stores/tickets'

const props = defineProps<{ order: Order }>()

const ticketsStore = useTicketsStore()
const { askRefund } = ticketsStore
const { isRefunding, refundErrorOf } = storeToRefs(ticketsStore)

// API stops refunds this long before the session starts
const REFUND_CUTOFF_MS = 2 * 60 * 60 * 1000

// Hall clock time, read as UTC and formatted in UTC so the viewer's timezone never shifts it
const startsAt = computed(
  () => new Date(`${props.order.session.date}T${props.order.session.time}:00Z`),
)

// e.g. Tue 15 Sep, built from parts since en-GB spells September "Sept"
function formatDay(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value
  return `${part('weekday')} ${part('day')} ${part('month')}`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

// e.g. Tue 15 Sep · 16:30
const schedule = computed(() => `${formatDay(startsAt.value)} · ${props.order.session.time}`)

// e.g. Galleria Tbilisi · Hall B
const venue = computed(
  () => `${props.order.session.venue.name} · Hall ${props.order.session.hall.name}`,
)

// e.g. MAX · Original with Subtitles
const format = computed(
  () => `${props.order.session.format.name} · ${props.order.session.language.name}`,
)

/**
 * Button state comes from isRefundable only (API: never compute the cutoff on the client),
 * the deadline is only worked out for the text
 */
const refundNote = computed(() => {
  if (props.order.status === 'refunded') return 'Refunded'
  if (!props.order.isRefundable) return 'No longer refundable'
  const until = new Date(startsAt.value.getTime() - REFUND_CUTOFF_MS)
  return `Refundable until ${formatTime(until)}, ${formatDay(until)}`
})
</script>

<template>
  <div class="flex flex-row gap-4.5 rounded-[26px] bg-card">
    <div class="flex grow flex-row items-center justify-start gap-4.5 px-7.5 py-5">
      <div class="h-33.5 w-25 rounded-[10px]">
        <img
          :src="order.session.movie.posterUrl"
          class="h-full w-full rounded-[10px] object-cover"
        />
      </div>
      <div class="flex flex-col justify-between gap-3">
        <div class="flex flex-row items-center justify-start gap-2.5">
          <span
            class="text-h2 text-nowrap text-primary uppercase"
            v-text="order.session.movie.title"
          />
          <span
            class="badge-hero badge-red px-2! py-0.75! text-nowrap"
            v-text="order.session.movie.ageRating.code"
          />
          <span
            class="text-body-m text-nowrap text-secondary"
            v-text="order.session.movie.runtimeMinutes + ' min'"
          />
        </div>
        <div class="flex flex-row items-center justify-start gap-10">
          <div class="flex flex-col items-start justify-between gap-1">
            <span class="text-overline text-secondary uppercase" v-text="'date'" />
            <span class="text-label-m text-primary" v-text="schedule" />
          </div>
          <div class="flex flex-col items-start justify-between gap-1">
            <span class="text-overline text-secondary uppercase" v-text="'venue'" />
            <span class="text-label-m text-primary" v-text="venue" />
          </div>
          <div class="flex flex-col items-start justify-between gap-1">
            <span class="text-overline text-secondary uppercase" v-text="'format'" />
            <span class="text-label-m text-primary" v-text="format" />
          </div>
        </div>
        <div class="flex flex-row items-center justify-start gap-2">
          <span class="text-overline text-secondary uppercase" v-text="'seats'" />
          <span
            v-for="ticket in order.tickets"
            :key="ticket.id"
            class="badge-default"
            v-text="ticket.seatCode + ' · ' + ticket.ticketType.name"
          />
        </div>
      </div>
    </div>
    <!-- divider -->
    <div
      class="relative w-px bg-[linear-gradient(to_bottom,currentColor_50%,transparent_50%)] bg-size-[1px_12px] bg-center bg-repeat-y text-raised"
    />
    <div class="flex w-75 flex-col justify-start gap-4 px-6 py-5">
      <div class="flex flex-col justify-between gap-0.5">
        <span class="text-overline text-secondary uppercase" v-text="'order'" />
        <span class="text-label-m text-primary uppercase" v-text="'#' + order.reference" />
      </div>
      <div class="flex flex-col justify-between gap-2.5">
        <div class="flex flex-row items-baseline justify-between">
          <span class="text-label-m text-secondary first-letter:uppercase" v-text="'total paid'" />
          <span class="text-h1 text-primary" v-text="'₾' + order.totalPrice" />
        </div>
      </div>
      <button
        type="button"
        class="btn-transparent uppercase"
        :disabled="order.status === 'refunded' || !order.isRefundable || isRefunding(order)"
        @click="askRefund(order)"
        v-text="'refund'"
      />
      <!-- A refused refund's message replaces the note until the next attempt -->
      <span
        v-if="refundErrorOf(order)"
        class="text-center text-body-s text-helper-red"
        v-text="refundErrorOf(order)"
      />
      <span v-else class="text-center text-body-s text-secondary" v-text="refundNote" />
    </div>
  </div>
</template>
