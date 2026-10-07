<script setup lang="ts">
import AppLink from '@/components/shared/AppLink.vue'
import type { Movie } from '@/types'
const props = defineProps<{ data: Movie[]; query?: string | null }>()

function splitTitle(title: string, query?: string | null) {
  const term = query?.trim()
  if (!term) return [{ text: title, match: false }]
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return title
    .split(new RegExp(`(${escaped})`, 'gi'))
    .filter(Boolean)
    .map((text) => ({ text, match: text.toLowerCase() === term.toLowerCase() }))
}
</script>
<template>
  <div class="flex flex-col items-center gap-1.5 p-2">
    <div class="flex w-full flex-row items-center justify-between px-2.5 pt-2 pb-1.5">
      <h2 class="text-overline text-secondary">films & events</h2>
      <span class="text-body-s text-secondary"
        >{{ data.length }} {{ data.length === 1 ? 'result' : 'results' }}</span
      >
    </div>
    <ul class="w-full">
      <li
        v-for="movie in data"
        :key="movie.id"
        class="transform rounded-[10px] py-2 pr-5 pl-2.5 transition-all ease-out duration-initial hover:bg-tint-white"
      >
        <AppLink
          :to="{ name: 'movie', params: { slug: movie.slug } }"
          class="flex w-full flex-row items-center gap-3.5"
        >
          <div class="h-14 w-10 rounded-md">
            <img class="content-cover rounded-md" :src="movie.posterUrl" />
          </div>
          <div class="flex grow flex-col items-start justify-center gap-0.75">
            <span class="text-label-m text-secondary">
              <span
                v-for="(part, i) in splitTitle(movie.title, query)"
                :key="i"
                :class="{ 'text-primary': part.match }"
                v-text="part.text"
              />
            </span>
            <span
              class="text-body-s text-secondary first-letter:uppercase"
              v-text="
                movie.kind + ' · ' + movie.ageRating.code + ' · ' + movie.runtimeMinutes + ' min'
              "
            />
          </div>
          <span
            v-if="movie.isComingSoon"
            class="text-label-m text-helper-orange capitalize"
            v-text="'coming soon'"
          />
          <span v-else class="text-label-m text-primary" v-text="'from ₾' + movie.fromPrice" />
        </AppLink>
      </li>
    </ul>
  </div>
</template>
