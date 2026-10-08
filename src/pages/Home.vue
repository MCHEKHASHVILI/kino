<script setup lang="ts">
import { Splide, SplideSlide } from '@splidejs/vue-splide'
// Core only: layout and behaviour, the look (arrows, dots) comes from our own classes
import '@splidejs/vue-splide/css/core'
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'

// Featured slider, GET /movies/featured fills it later
const sliderOptions = {
  type: 'loop',
  autoplay: true,
  interval: 6000,
  pauseOnHover: true,
  arrows: false,
  speed: 700,
  classes: {
    pagination: 'splide__pagination absolute! bottom-10 left-15 flex flex-row gap-2',
    page: 'splide__pagination__page block h-1.5 w-6 cursor-pointer rounded-full bg-tint-white transition-all duration-300 [&.is-active]:w-10 [&.is-active]:bg-helper-red',
  },
}

// Placeholder rows until the sections are wired to the API
const sections = [
  // Movies this browser opened, kept locally (no API for it), hidden while empty
  { id: 'recently-viewed', title: 'recently viewed', cards: 4 },
  // GET /movies/now-playing
  { id: 'now-playing', title: 'now playing', cards: 6 },
  // GET /movies/coming-soon
  { id: 'coming-soon', title: 'coming soon', cards: 6 },
]
</script>

<template>
  <div class="flex flex-col gap-14 pb-14">
    <!-- 1. Slider: full width breakout from the wrapper, header overlays it (route meta overlayHeader) -->
    <section class="relative left-1/2 h-141.75 w-screen -translate-x-1/2 overflow-hidden">
      <Splide :options="sliderOptions" aria-label="Featured" class="h-full">
        <SplideSlide v-for="slide in 3" :key="slide" class="relative h-141.75">
          <!-- movie.backdropUrl -->
          <div class="absolute inset-0 bg-raised" />
          <!-- Fades into the page at the bottom so the text stays readable -->
          <div class="absolute inset-0 bg-linear-to-t from-page via-page/40 to-transparent" />

          <div class="absolute bottom-20 left-15 flex w-145 flex-col gap-4">
            <span class="badge-hero badge-red w-fit uppercase" v-text="'now playing'" />
            <h2 class="text-h1 text-primary uppercase" v-text="'movie title'" />
            <!-- age rating · runtime · genres -->
            <span class="text-body-m text-secondary" v-text="'PG · 120 min · Drama, Action'" />
            <div class="flex flex-row gap-3">
              <button type="button" class="btn-primary uppercase" v-text="'book tickets'" />
              <button type="button" class="btn-transparent uppercase" v-text="'details'" />
            </div>
          </div>
        </SplideSlide>
      </Splide>
    </section>

    <!-- 2. Recently viewed, 3. Now playing, 4. Coming soon -->
    <section v-for="section in sections" :key="section.id" class="flex flex-col gap-5 px-12.75">
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-h2 text-primary capitalize" v-text="section.title" />
        <!-- Link to the full list (sessions page) -->
        <span class="text-label-m text-secondary capitalize" v-text="'see all'" />
      </div>

      <!-- Scrolls sideways, Shift+wheel so the page scroll is never caught -->
      <HorizontalScroll class="gap-4" wheel="shift">
        <article
          v-for="card in section.cards"
          :key="card"
          class="flex w-50 shrink-0 flex-col gap-3"
        >
          <!-- movie.posterUrl -->
          <div class="aspect-2/3 w-full rounded-[14px] bg-raised" />
          <div class="flex flex-col gap-1">
            <span class="text-button text-primary" v-text="'Movie title'" />
            <!-- age rating · runtime, or the release date for coming soon -->
            <span class="text-body-s text-secondary" v-text="'PG · 120 min'" />
          </div>
        </article>
      </HorizontalScroll>
    </section>
  </div>
</template>
