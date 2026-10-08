<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import { useModalStore } from '@/stores/modals'
import { useBookingCheckoutStore } from '@/stores/booking/checkout'
import { sessionVenueSchedule } from '@/stores/booking/session'
import { countTicketTypes } from '@/stores/booking/ticketTypes'
import IconLoader from '@/components/shared/IconLoader.vue'
import AppLink from '@/components/shared/AppLink.vue'

const { activeModal } = storeToRefs(useModalStore())
const checkoutStore = useBookingCheckoutStore()
const { clearOrder } = checkoutStore
// Paid order from POST /orders, opened by pay right after it is set
const { order } = storeToRefs(checkoutStore)

// Seats sold by the order, e.g. B3, B4, B5
const seatCodes = computed(
  () => order.value?.tickets.map((ticket) => ticket.seatCode).join(', ') ?? '',
)

// Tickets counted per type, e.g. 2 × Adult, 1 × Child
const ticketCounts = computed(() =>
  countTicketTypes(order.value?.tickets.map(({ ticketType }) => ticketType.name) ?? []).join(', '),
)

// Shown once, every way of closing unmounts it
onUnmounted(clearOrder)
</script>

<template>
  <BaseModal :isOpen="!!activeModal" @close="$emit('close')" hideHeader>
    <div v-if="order" class="flex w-270.5 flex-col items-center justify-between gap-6">
      <div class="flex w-91.25 flex-col items-center justify-between gap-4">
        <div class="flex h-13 w-13 items-center justify-center rounded-full bg-helper-green">
          <IconLoader name="Confirm" class="rouded-full text-[32px] text-primary" />
        </div>
        <div class="flex flex-col items-center justify-between gap-2.5 text-center">
          <h1 class="text-h1 text-primary first-letter:uppercase" v-text="'booking confirmed!'" />
          <span
            class="text-body-m text-secondary"
            v-text="'Your tickets are ready. We\'ve sent the confirmation to your email.'"
          />
        </div>
        <div class="flex h-6.5 w-47.5 items-center justify-center rounded-full bg-raised">
          <span v-text="'order #' + order.reference" class="text-label-s text-primary uppercase" />
        </div>
      </div>
      <div class="flex flex-col justify-between gap-3 rounded-xl bg-card p-5">
        <div class="flex flex-row items-start justify-start gap-2.5">
          <div class="h-16 w-12 rounded-lg">
            <img
              :src="order.session.movie.posterUrl"
              class="content-fit h-full w-full rounded-lg"
            />
          </div>
          <div class="flex flex-col items-start justify-start gap-2">
            <span class="text-button text-primary uppercase" v-text="order.session.movie.title" />
            <span class="text-body-s text-secondary" v-text="sessionVenueSchedule(order.session)" />
          </div>
        </div>
        <!-- divider -->
        <div class="h-px w-158.25 bg-raised" />
        <div class="flex w-full flex-row justify-between">
          <span class="text-body-s text-secondary capitalize" v-text="'seats'" />
          <span class="text-label-s text-primary" v-text="seatCodes" />
        </div>
        <div class="flex w-full flex-row justify-between">
          <span class="text-body-s text-secondary capitalize" v-text="'tickets'" />
          <span class="text-body-s text-primary" v-text="ticketCounts" />
        </div>
        <!-- divider -->
        <div class="h-px w-158.25 bg-raised" />
        <div class="flex w-full flex-row justify-between">
          <span class="text-body-s text-secondary uppercase" v-text="'total paid'" />
          <span class="text-h3 text-primary" v-text="'₾ ' + order.totalPrice" />
        </div>
      </div>
      <div class="flex flex-row items-center justify-center gap-3">
        <AppLink
          :to="{ name: 'profile', query: { tab: 'tickets' } }"
          class="btn-primary first-letter:uppercase"
        >
          <span v-text="'view my tickets'" />
        </AppLink>
        <AppLink :to="{ name: 'home' }" class="btn-transparent first-letter:uppercase">
          <span v-text="'back to home'" />
        </AppLink>
      </div>
    </div>
  </BaseModal>
</template>
