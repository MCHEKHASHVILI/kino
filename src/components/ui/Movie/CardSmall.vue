<script setup lang="ts">
import type { RecentMovie } from '@/stores/recentlyViewed'
import AppLink from '@/components/shared/AppLink.vue'

// Movie from this browser's history (home Recently viewed), back to its movie page
defineProps<{ movie: RecentMovie }>()
</script>

<template>
  <AppLink :to="{ name: 'movie', params: { slug: movie.slug } }" class="card-small">
    <!-- Styles in assets/styles/components/cards.css -->
    <div class="poster">
      <img :src="movie.posterUrl" :alt="movie.title" loading="lazy" />
    </div>
    <div class="content">
      <span class="title" v-text="movie.title" />
      <span
        class="details"
        v-text="
          [movie.genres.map((genre) => genre.name).join(', '), `${movie.runtimeMinutes} min`]
            .filter(Boolean)
            .join(' · ')
        "
      />
      <span class="badge-hero badge-red" v-text="movie.ageRating.code" />
    </div>
  </AppLink>
</template>
