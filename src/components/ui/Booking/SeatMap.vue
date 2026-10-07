<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSeatMapViewport } from '@/composables/useSeatMapViewport'
import { useBookingStore } from '@/stores/booking'

const bookingStore = useBookingStore()
const { isBlocked, isDisabled } = bookingStore
const { seatMap, selectedSeatIds } = storeToRefs(bookingStore)

const viewport = ref<HTMLElement | null>(null)
const canvas = ref<HTMLElement | null>(null)
// Zoom range is tuned on a 720px wide (w-180) map, narrower ones keep the same proportions
const { fits, zoomIn, zoomOut, fit } = useSeatMapViewport(viewport, canvas, {
  referenceWidth: 720,
  // Zoom buttons column: right-3 (12px) + size-11 (44px) + 12px gap
  fitPaddingX: 68,
})
</script>

<template>
  <div class="relative size-full">
    <div ref="viewport" class="relative size-full">
      <!-- Full size hall (52px seats), panzoom scales and moves it inside the viewport -->
      <div
        ref="canvas"
        class="absolute top-0 left-0 flex w-max flex-col items-center gap-8 px-5 pb-5"
      >
        <div
          class="flex w-full flex-row items-center justify-center self-stretch rounded-b-[20px] bg-raised py-2.25"
        >
          <span class="text-label-s text-primary uppercase" v-text="'screen'" />
        </div>
        <div
          v-for="section in seatMap?.sections"
          :key="section.name"
          class="flex flex-col items-center gap-6"
        >
          <span class="text-label-s text-secondary uppercase" v-text="section.name" />
          <!-- Rows of one section share a width, sections don't, so each is its own block -->
          <div class="flex flex-col gap-2">
            <div
              v-for="row in section.rows"
              :key="row.label"
              class="flex flex-row items-center justify-center gap-2"
            >
              <div class="flex h-8 w-5 items-center justify-start">
                <span v-text="row.label" />
              </div>
              <template v-for="seat in row.seats" :key="seat.id">
                <!-- No seat at all (gangway, wheelchair space), keeps the grid aligned -->
                <span
                  v-if="seat.state === 'unavailable'"
                  class="is-unavailable badge-seat"
                  :class="{ 'mr-6': seat.aisleAfter }"
                  aria-hidden="true"
                  v-text="seat.label"
                />
                <label
                  v-else
                  class="badge-seat relative"
                  :class="{
                    'is-sold': seat.state === 'sold',
                    'is-held': seat.state === 'held',
                    // Free seat locked only because the 3 seat limit is reached
                    'is-disabled': !isBlocked(seat) && isDisabled(seat),
                    'mr-6': seat.aisleAfter,
                  }"
                  :title="seat.code"
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    :value="seat.id"
                    v-model="selectedSeatIds"
                    :disabled="isDisabled(seat)"
                    :aria-label="'Seat ' + seat.code"
                  />
                  <span v-text="seat.label" />
                </label>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Outside the panzoom parent, so presses aren't taken as a pan -->
    <div v-if="!fits" class="absolute right-3 bottom-3 flex flex-col gap-2">
      <button
        type="button"
        class="flex size-11 cursor-pointer items-center justify-center rounded-full bg-card/60 text-button text-primary backdrop-blur-sm transition-colors hover:bg-card"
        aria-label="Zoom in"
        @click="zoomIn"
        v-text="'+'"
      />
      <button
        type="button"
        class="flex size-11 cursor-pointer items-center justify-center rounded-full bg-card/60 text-button text-primary backdrop-blur-sm transition-colors hover:bg-card"
        aria-label="Zoom out"
        @click="zoomOut"
        v-text="'−'"
      />
      <button
        type="button"
        class="flex size-11 cursor-pointer items-center justify-center rounded-full bg-card/60 text-label-s text-primary uppercase backdrop-blur-sm transition-colors hover:bg-card"
        aria-label="Fit hall to view"
        @click="fit"
        v-text="'fit'"
      />
    </div>
  </div>
</template>
