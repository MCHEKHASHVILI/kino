<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import SeatMapView from '@/components/ui/Booking/SeatMap.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useModalStore } from '@/stores/modals'
import { useMovieStore } from '@/stores/movie'
import { useBookingStore } from '@/stores/booking'
import { useBookingSeatsStore } from '@/stores/booking/seats'

const { activeModal } = storeToRefs(useModalStore())
const { movie } = storeToRefs(useMovieStore())
const bookingStore = useBookingStore()
const { fetchSeats } = bookingStore
const { removeSeat } = useBookingSeatsStore()
const { session, seatMap, heldSeats, progress, subtitle, ticketTypes } = storeToRefs(bookingStore)

// Modal is mounted on every open, so immediate also refetches the map each time it opens
watch(() => session.value?.id, fetchSeats, { immediate: true })
</script>
<template>
  <BaseModal
    :isOpen="!!activeModal"
    @close="$emit('close')"
    :title="movie ? movie.title : ''"
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
        <div class="flex w-180 flex-col justify-between gap-8">
          <div class="flex w-full flex-row gap-2 rounded-full bg-card">
            <label v-for="stage in ['seats', 'checkout']" class="badge-progress">
              <input
                type="radio"
                class="sr-only"
                :value="stage"
                v-model="progress"
                name="progress"
              />
              <span class="uppercase" v-text="stage" />
            </label>
          </div>
          <!-- Fixed size viewport, the hall pans and zooms inside it -->
          <div class="h-101.25 w-full">
            <SeatMapView v-if="seatMap" />
          </div>
          <div class="flex flex-row items-center justify-center gap-6">
            <div class="flex flex-row items-center justify-between gap-2">
              <span class="badge-seat h-4 w-4 rounded-[5px]" />
              <span
                class="text-body-s text-secondary first-letter:uppercase"
                v-text="'available'"
              />
            </div>
            <div class="flex flex-row items-center justify-between gap-2">
              <span class="is-checked badge-seat h-4 w-4 rounded-[5px]" />
              <span class="text-body-s text-secondary first-letter:uppercase" v-text="'selected'" />
            </div>
            <div class="flex flex-row items-center justify-between gap-2">
              <span class="is-sold is-sold badge-seat h-4 w-4 rounded-[5px]" />
              <span class="text-body-s text-secondary first-letter:uppercase" v-text="'sold'" />
            </div>
            <div class="flex flex-row items-center justify-between gap-2">
              <span class="is-held is-heald badge-seat h-4 w-4 rounded-[5px]" />
              <span
                class="text-body-s text-secondary first-letter:uppercase"
                v-text="'held by another user'"
              />
            </div>
          </div>
        </div>
        <!-- divider -->
        <div class="w-px border-l border-l-card"></div>
        <!-- pricing -->
        <div class="flex flex-1 flex-col justify-between">
          <div class="flex h-87.75 w-full flex-col justify-start gap-6">
            <!-- empty -->
            <div class="flex flex-col justify-between gap-3">
              <span class="text-button text-primary" v-text="'Your seats · Max 3'" />
              <span
                v-if="!heldSeats?.seats.length"
                class="text-body-s text-secondary"
                v-text="'Pick up to 3 seats from the map. Each seat can carry its own ticket type.'"
              />
              <div v-else class="flex flex-col justify-between gap-3">
                <div
                  v-for="seat in heldSeats?.seats"
                  :key="seat.seatId"
                  class="flex w-80.25 flex-col gap-1.5 rounded-2xl bg-card p-3.75"
                >
                  <div class="flex flex-col gap-3">
                    <div class="flex flex-row justify-between">
                      <div class="flex w-[152.5px] flex-row items-center justify-start gap-3">
                        <span class="text-body-s text-secondary capitalize" v-text="'seat'" />
                        <span class="text-label-s text-primary" v-text="seat.code" />
                      </div>
                      <div class="relative flex w-[84.25px] items-center">
                        <span class="" v-text="'₾ ' + seat.price" />
                        <button
                          type="button"
                          class="flex cursor-pointer items-center"
                          :aria-label="'Remove seat ' + seat.code"
                          @click="removeSeat(seat.seatId)"
                        >
                          <IconLoader
                            name="Close"
                            class="absolute right-0 text-[16px] text-secondary"
                          />
                        </button>
                      </div>
                    </div>
                    <!-- divider -->
                    <div class="relative flex h-px w-full items-center bg-raised"></div>
                    <div class="flex flex-row items-center justify-between gap-2">
                      <label v-for="type in ticketTypes" class="badge-red">
                        <input type="radio" class="sr-only" :value="type" />
                        <span class="text-primary" v-text="type.name" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex w-full flex-col gap-3 pt-2.5">
            <div class="flex w-full flex-row items-center justify-between">
              <span class="text primary text-label-s uppercase" v-text="'subtotal'" />
              <span class="text-h1 text-primary" v-text="'₾ ' + (heldSeats?.subtotal ?? 0)" />
            </div>
            <button class="btn-primary uppercase" v-text="'next checkout'" :disabled="true" />
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
