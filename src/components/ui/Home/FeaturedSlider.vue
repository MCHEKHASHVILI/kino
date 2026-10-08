<script setup lang="ts">
import { shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { Splide, SplideSlide } from '@splidejs/vue-splide'
// Core only: layout and behaviour, the controls are our own
import '@splidejs/vue-splide/css/core'
import AppLink from '@/components/shared/AppLink.vue'
import type { Splide as SplideInstance } from '@splidejs/splide'
import FeaturedSliderControls from '@/components/ui/Home/FeaturedSliderControls.vue'
import MovieBadges from '@/components/ui/Movie/MovieBadges.vue'
import { useCatalogueStore } from '@/stores/catalogue'

// GET /movies/featured, the hero titles of the home page
const catalogueStore = useCatalogueStore()
const { featured } = storeToRefs(catalogueStore)
catalogueStore.fetchFeatured()

const sliderOptions = {
  type: 'loop',
  autoplay: true,
  interval: 3000,
  pauseOnHover: true,
  // Own controls below (indicators and prev / next in one row), Splide's are off
  arrows: false,
  pagination: false,
  // Slide transition
  speed: 300,
  easing: 'ease-out',
} as const

// Handed to the controls once mounted, the slider itself keeps no state that changes per slide
const splide = shallowRef<SplideInstance | null>(null)
</script>

<template>
  <!-- Full width breakout from the page wrapper, the header overlays it (route meta overlayHeader) -->
  <section class="relative left-1/2 h-190 w-screen -translate-x-1/2 overflow-hidden">
    <!-- Mounted once the movies are in, Splide reads its slides when it starts -->
    <Splide
      v-if="featured?.length"
      :options="sliderOptions"
      aria-label="Featured films"
      class="h-full"
      @splide:mounted="(instance: SplideInstance) => (splide = instance)"
    >
      <SplideSlide v-for="(movie, index) in featured" :key="movie.id" class="relative h-190">
        <!-- First backdrop is the page's largest image, load it first -->
        <img
          :src="movie.backdropUrl"
          alt=""
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          class="absolute inset-0 size-full object-cover object-top"
        />
        <!-- Darkens the left for the text and fades into the page at the bottom -->
        <div class="absolute inset-0 bg-linear-to-l from-black/80 to-black/8" />

        <!-- Same container as the controls below, lines up with them and the header -->
        <div class="absolute inset-x-0 bottom-36">
          <div class="wrapper">
            <div class="flex w-145 flex-col gap-3.75">
              <span class="badge-hero badge-red w-fit uppercase" v-text="'now playing'" />
              <div class="flex flex-col gap-5">
                <div class="flex flex-col justify-between gap-3.75">
                  <h2 class="text-display text-primary uppercase" v-text="movie.title" />
                  <!-- Age rating, runtime and formats, the same badges as the movie page -->
                  <MovieBadges :movie="movie" />
                  <p class="line-clamp-3 text-body-m text-primary" v-text="movie.synopsis" />
                </div>
                <div class="flex flex-row gap-3">
                  <!-- Featured films are always bookable (API: a subset of now playing) -->
                  <AppLink
                    :to="{ name: 'movie', params: { slug: movie.slug } }"
                    class="btn-primary uppercase"
                  >
                    book tickets
                  </AppLink>
                  <AppLink :to="{ name: 'sessions' }" class="btn-transparent uppercase">
                    all sessions
                  </AppLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SplideSlide>
    </Splide>
    <!-- Loading, or nothing featured: an empty backdrop keeps the header readable -->
    <div v-else class="absolute inset-0 bg-raised" :class="{ 'animate-pulse': !featured }" />

    <!-- Indicators and prev / next in one row, in the page wrapper (centered on wide screens) -->
    <FeaturedSliderControls
      v-if="featured && featured.length > 1"
      :splide="splide"
      :movies="featured"
    />
  </section>
</template>
