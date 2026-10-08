<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'
import FeaturedSlider from '@/components/ui/Home/FeaturedSlider.vue'
import CardBig from '@/components/ui/Movie/CardBig.vue'
import CardMedium from '@/components/ui/Movie/CardMedium.vue'
import CardSmall from '@/components/ui/Movie/CardSmall.vue'
import { useCatalogueStore } from '@/stores/catalogue'
import { useRecentlyViewedStore } from '@/stores/recentlyViewed'

const catalogueStore = useCatalogueStore()
const { nowPlaying, comingSoon } = storeToRefs(catalogueStore)
catalogueStore.fetchNowPlaying()
catalogueStore.fetchComingSoon()

// Kept in this browser, the section is hidden until a movie has been opened
const { movies: recentlyViewed } = storeToRefs(useRecentlyViewedStore())
</script>

<template>
  <div class="flex flex-col gap-14 pb-14">
    <!-- 1. Featured films, GET /movies/featured -->
    <FeaturedSlider />

    <!-- 2. Recently viewed, movies opened in this browser -->
    <section v-if="recentlyViewed.length" class="flex flex-col gap-5">
      <h2 class="text-h2 text-primary capitalize" v-text="'recently viewed'" />
      <!-- Rows scroll sideways, Shift+wheel so the page scroll is never caught -->
      <HorizontalScroll class="gap-4" wheel="shift">
        <CardSmall v-for="movie in recentlyViewed" :key="movie.id" :movie="movie" />
      </HorizontalScroll>
    </section>
    <!-- divider -->
    <div class="h-px w-full bg-raised" />
    <!-- 3. Now playing, GET /movies/now-playing -->
    <section class="flex flex-col gap-5">
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-h2 text-primary capitalize" v-text="'now playing'" />
        <!-- Link to the full list (sessions page) -->
        <span class="text-label-m text-secondary capitalize" v-text="'see all'" />
      </div>
      <!-- No gap: the cards' own padding spaces them (no dead zone between them), -mx-2 keeps
           the first and last card in line with the section -->
      <HorizontalScroll class="-mx-2" wheel="shift">
        <CardBig v-for="movie in nowPlaying ?? []" :key="movie.id" :movie="movie" growth="inline" />
      </HorizontalScroll>
    </section>
    <!-- divider -->
    <div class="h-px w-full bg-raised" />
    <!-- 4. Coming soon, GET /movies/coming-soon -->
    <section class="flex flex-col gap-5">
      <h2 class="text-h2 text-primary capitalize" v-text="'coming soon'" />
      <HorizontalScroll class="gap-4" wheel="shift">
        <CardMedium v-for="movie in comingSoon ?? []" :key="movie.id" :movie="movie" />
      </HorizontalScroll>
    </section>
  </div>
</template>
