<script setup lang="ts">
import type { Movie } from '@types'
import IconLoader from '@/components/shared/IconLoader.vue'

// Age rating, runtime and formats as one row of badges, shared by the movie page and the home slider
defineProps<{ movie: Pick<Movie, 'ageRating' | 'runtimeMinutes' | 'formats'> }>()
</script>

<template>
  <div class="flex flex-row items-center justify-start gap-1">
    <span class="badge-hero badge-red" v-text="movie.ageRating.code" />
    <div class="badge-hero badge-default">
      <IconLoader name="Timer" class="text-14px" />
      <span v-text="movie.runtimeMinutes" />
      <span class="capitalize" v-text="'min'" />
    </div>
    <span
      v-for="format in movie.formats"
      :key="format.id"
      class="badge-hero badge-default uppercase"
      v-text="format.name"
    />
  </div>
</template>
