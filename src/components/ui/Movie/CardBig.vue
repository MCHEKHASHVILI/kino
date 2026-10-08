<script setup lang="ts">
import type { Movie } from '@types'
import AppLink from '@/components/shared/AppLink.vue'

// Bookable movie (home Now playing), poster card linking to the movie page
defineProps<{ movie: Movie }>()
</script>

<template>
  <AppLink
    :to="{ name: 'movie', params: { slug: movie.slug } }"
    class="flex w-50 shrink-0 flex-col gap-3"
  >
    <img
      :src="movie.posterUrl"
      :alt="movie.title"
      loading="lazy"
      class="aspect-2/3 w-full rounded-[14px] bg-raised object-cover"
    />
    <div class="flex flex-col gap-1">
      <span class="text-button text-primary" v-text="movie.title" />
      <span
        class="text-body-s text-secondary"
        v-text="`${movie.ageRating.code} · ${movie.runtimeMinutes} min · from ₾${movie.fromPrice}`"
      />
    </div>
  </AppLink>
</template>
