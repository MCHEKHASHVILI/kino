<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '@types'
import AppLink from '@/components/shared/AppLink.vue'

// Movie without sessions yet (home Coming soon). Opens the movie page, never seat selection (API)
const props = defineProps<{ movie: Movie }>()

// e.g. 14 Nov 2026
const releaseDate = computed(() =>
  new Date(props.movie.releaseDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
)
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
      <span class="text-body-s text-secondary" v-text="'Premiere ' + releaseDate" />
    </div>
  </AppLink>
</template>
