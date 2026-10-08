<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Splide } from '@splidejs/splide'
import IconLoader from '@/components/shared/IconLoader.vue'

/**
 * Featured slider's indicators and prev / next, in one row.
 * Its own component on purpose: the active index changes on every slide, and keeping that state
 * in the slider would re-render the slides mid move, which cut Splide's transition short
 */
const props = defineProps<{
  splide: Splide | null
  movies: { id: number; title: string }[]
}>()

// Real index of the shown film, clones of the loop report the index they stand for
const activeIndex = ref(0)

watch(
  () => props.splide,
  (splide) => {
    if (!splide) return
    activeIndex.value = splide.index
    splide.on('move', (index: number) => (activeIndex.value = index))
  },
  { immediate: true },
)

function go(control: number | '<' | '>') {
  props.splide?.go(control)
}
</script>

<template>
  <div
    class="wrapper absolute inset-x-0 bottom-12 flex flex-row items-center justify-between gap-6"
  >
    <div class="top-149 flex w-full flex-row items-center justify-between gap-2">
      <button
        v-for="(movie, index) in movies"
        :key="movie.id"
        type="button"
        class="block h-0.75 w-full cursor-pointer rounded-full transition-colors duration-300"
        :class="index === activeIndex ? 'bg-helper-red' : 'bg-tint-white'"
        :aria-label="'Show ' + movie.title"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="go(index)"
      />
    </div>
    <div class="flex flex-row items-center justify-between gap-3">
      <button
        type="button"
        class="flex size-13.5 cursor-pointer items-center justify-center rounded-full bg-overlay-scrim text-primary hover:bg-page hover:shadow-[0_2px_8px_0_var(--shadow)]"
        aria-label="Previous film"
        @click="go('<')"
      >
        <IconLoader name="ArrowRound" class="rotate-180 text-[34px]" />
      </button>
      <button
        type="button"
        class="flex size-13.5 cursor-pointer items-center justify-center rounded-full bg-overlay-scrim text-primary hover:bg-page hover:shadow-[0_2px_8px_0_var(--shadow)]"
        aria-label="Next film"
        @click="go('>')"
      >
        <IconLoader name="ArrowRound" class="text-[34px]" />
      </button>
    </div>
  </div>
</template>
