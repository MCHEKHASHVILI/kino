<script setup lang="ts">
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'
import FeaturedSlider from '@/components/ui/Home/FeaturedSlider.vue'

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
    <!-- 1. Featured films, GET /movies/featured -->
    <FeaturedSlider />

    <!-- 2. Recently viewed, 3. Now playing, 4. Coming soon -->
    <section v-for="section in sections" :key="section.id" class="flex flex-col gap-5">
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
