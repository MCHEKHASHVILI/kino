<script setup lang="ts">
import type { RecentMovie } from '@/stores/recentlyViewed'
import AppLink from '@/components/shared/AppLink.vue'

// Movie from this browser's history (home Recently viewed), back to its movie page
defineProps<{ movie: RecentMovie }>()
</script>

<template>
  <AppLink
    :to="{ name: 'movie', params: { slug: movie.slug } }"
    class="flex w-82.5 flex-row gap-3 rounded-2xl bg-raised p-2.5"
  >
    <div class="h-16.75 w-22 rounded-lg">
      <img
        :src="movie.posterUrl"
        :alt="movie.title"
        loading="lazy"
        class="h-16.75 w-22 rounded-lg object-cover"
      />
    </div>
    <div class="flex w-52.5 flex-col justify-center gap-1">
      <span class="text-button text-primary" v-text="movie.title" />
      <span
        class="text-body-s text-secondary"
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
