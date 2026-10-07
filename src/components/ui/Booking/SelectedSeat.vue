<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { SelectedTicket } from '@types'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useBookingSeatsStore } from '@/stores/booking/seats'
import { useBookingTicketTypesStore } from '@/stores/booking/ticketTypes'

defineProps<{ ticket: SelectedTicket }>()

const { removeSeat } = useBookingSeatsStore()
const ticketTypesStore = useBookingTicketTypesStore()
const { setTicketType, isTicketTypeAllowed } = ticketTypesStore
const { ticketTypes } = storeToRefs(ticketTypesStore)
</script>

<template>
  <div class="flex w-80.25 flex-col gap-1.5 rounded-2xl bg-card p-3.75">
    <div class="flex flex-col gap-3">
      <div class="flex flex-row justify-between">
        <div class="flex w-[152.5px] flex-row items-center justify-start gap-3">
          <span class="text-body-s text-secondary capitalize" v-text="'seat'" />
          <span class="text-label-s text-primary" v-text="ticket.code" />
        </div>
        <div class="relative flex w-[84.25px] items-center">
          <span class="" v-text="'₾ ' + ticket.price" />
          <button
            type="button"
            class="flex cursor-pointer items-center"
            :aria-label="'Remove seat ' + ticket.code"
            @click="removeSeat(ticket.seatId)"
          >
            <IconLoader name="Close" class="absolute right-0 text-[16px] text-secondary" />
          </button>
        </div>
      </div>
      <!-- divider -->
      <div class="relative flex h-px w-full items-center bg-raised"></div>
      <div class="flex flex-row items-center justify-between gap-2">
        <label v-for="type in ticketTypes" :key="type.slug" class="badge-ticket-types capitalize">
          <input
            type="radio"
            class="sr-only"
            :name="'ticket-type-' + ticket.seatId"
            :value="type.slug"
            :checked="ticket.ticketType === type.slug"
            :disabled="!isTicketTypeAllowed(type.slug)"
            @change="setTicketType(ticket.seatId, type.slug)"
          />
          <span class="text-primary" v-text="type.name + ' ' + type.priceRatio * 100 + '%'" />
        </label>
      </div>
    </div>
  </div>
</template>
