<script setup lang="ts">
import { onUnmounted, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import SeatMapView from '@/components/ui/Booking/SeatMap.vue'
import SeatLegend from '@/components/ui/Booking/SeatLegend.vue'
import SelectedSeat from '@/components/ui/Booking/SelectedSeat.vue'
import CheckoutForm from '@/components/ui/Booking/CheckoutForm.vue'
import OrderSummary from '@/components/ui/Booking/OrderSummary.vue'
import { useModalStore } from '@/stores/modals'
import { useBookingStore } from '@/stores/booking'
import { useBookingSeatsStore } from '@/stores/booking/seats'
import { useBookingSessionStore } from '@/stores/booking/session'
import { useBookingTicketTypesStore } from '@/stores/booking/ticketTypes'
import { useBookingCheckoutStore } from '@/stores/booking/checkout'

const { activeModal } = storeToRefs(useModalStore())
const bookingStore = useBookingStore()
const { fetchSeats, proceedToCheckout, closeBooking, goToStep } = bookingStore
const { selectedSeats, maxSeats } = storeToRefs(useBookingSeatsStore())
const { selectedTickets } = storeToRefs(useBookingTicketTypesStore())
const { session, subtitle } = storeToRefs(useBookingSessionStore())
const { seatMap, progress, subtotal, isHolding, canSwitchStep } = storeToRefs(bookingStore)
const { isFilled, isPaying } = storeToRefs(useBookingCheckoutStore())

const STEPS = ['seats', 'checkout'] as const

const stepInputs = useTemplateRef<HTMLInputElement[]>('stepInputs')

/**
 * Radios are checked from the store's progress, picking one asks the store to move
 * (it may hold first or refuse). The browser checks the clicked radio on its own, and when progress
 * doesn't change (failed hold) Vue has nothing to patch, so the radios are re-synced to the real step
 */
async function changeStep(stage: (typeof STEPS)[number]) {
  await goToStep(stage)
  stepInputs.value?.forEach((input) => (input.checked = input.value === progress.value))
}

// Modal is mounted on every open, so immediate also refetches the map each time it opens
watch(() => session.value?.id, fetchSeats, { immediate: true })

// Every way of closing (close button, navigation, another modal) unmounts it, a page reload does not
onUnmounted(closeBooking)
</script>
<template>
  <BaseModal
    :isOpen="!!activeModal"
    @close="$emit('close')"
    :title="session?.movie.title ?? ''"
    :subtitle="subtitle"
  >
    <template #exit>
      <div
        class="badge-default flex flex-col items-center justify-between gap-0.5 rounded-xl bg-card px-3.5 py-2 text-center"
      >
        <span class="text-label-s text-nowrap text-secondary uppercase" v-text="'seats held'" />
        <span class="text-button text-primary" v-text="'time'" />
      </div>
    </template>
    <div class="flex w-270.5 flex-col">
      <div class="flex flex-row justify-between gap-5">
        <div class="flex flex-col">
          <div class="flex w-full flex-row gap-2 rounded-full bg-card">
            <!-- Clickable once seats are held and some are still picked -->
            <label
              v-for="stage in STEPS"
              :key="stage"
              class="badge-progress"
              :aria-current="progress === stage ? 'step' : undefined"
            >
              <input
                type="radio"
                class="sr-only"
                ref="stepInputs"
                :value="stage"
                :checked="progress === stage"
                name="progress"
                :disabled="!canSwitchStep"
                @change="changeStep(stage)"
              />
              <span class="uppercase" v-text="stage" />
            </label>
          </div>
          <div class="flex w-180 flex-col justify-start gap-8">
            <template v-if="progress === 'seats'">
              <!-- Fixed size viewport, the hall pans and zooms inside it -->
              <div class="h-101.25 w-full">
                <SeatMapView v-if="seatMap" />
              </div>
              <SeatLegend />
            </template>
            <CheckoutForm v-else class="mt-8" />
          </div>
        </div>
        <!-- divider -->
        <div class="h-[485px] w-px border-l border-l-card"></div>
        <!-- pricing -->
        <div class="flex flex-1 flex-col justify-between">
          <div class="flex h-87.75 w-full flex-col justify-start gap-6">
            <OrderSummary v-if="progress === 'checkout'" />
            <div v-else class="flex flex-col justify-between gap-3">
              <span
                class="text-button text-primary"
                v-text="'Your seats · Max ' + (maxSeats ?? '')"
              />
              <span
                v-if="!selectedSeats.length"
                class="text-body-s text-secondary"
                v-text="
                  'Pick up to ' +
                  (maxSeats ?? '') +
                  ' seats from the map. Each seat can carry its own ticket type.'
                "
              />
              <div v-else class="flex flex-col justify-between gap-3">
                <SelectedSeat
                  v-for="ticket in selectedTickets"
                  :key="ticket.seatId"
                  :ticket="ticket"
                />
              </div>
            </div>
          </div>
          <div class="flex w-full flex-col gap-3 pt-2.5">
            <div class="flex w-full flex-row items-center justify-between">
              <span class="text primary text-label-s uppercase" v-text="'subtotal'" />
              <span class="text-h1 text-primary" v-text="'₾ ' + subtotal" />
            </div>
            <button
              v-if="progress === 'seats'"
              type="button"
              class="btn-primary uppercase"
              :disabled="!selectedSeats.length || isHolding"
              @click="proceedToCheckout"
              v-text="'next checkout'"
            />
            <!-- Submits CheckoutForm, enabled once every field is filled -->
            <button
              v-else
              type="submit"
              form="checkout-form"
              class="btn-primary uppercase"
              :disabled="!isFilled || isPaying"
              v-text="'Pay: Complete order'"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
