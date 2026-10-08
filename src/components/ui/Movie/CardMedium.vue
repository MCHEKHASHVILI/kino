<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Movie } from '@types'
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useCatalogueStore } from '@/stores/catalogue'

// Movie without sessions yet (home Coming soon). Opens the movie page, never seat selection (API)
const props = defineProps<{ movie: Movie }>()

const catalogueStore = useCatalogueStore()
const { notify } = catalogueStore
const { isNotifying } = storeToRefs(catalogueStore)

const movieRoute = computed(() => ({ name: 'movie', params: { slug: props.movie.slug } }))

// e.g. In cinemas 2 October (shown uppercase)
const releaseDate = computed(
  () =>
    'In cinemas ' +
    new Date(props.movie.releaseDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    }),
)

// e.g. Science Fiction, Mystery · 100 min
const details = computed(() =>
  [props.movie.genres.map((genre) => genre.name).join(', '), `${props.movie.runtimeMinutes} min`]
    .filter(Boolean)
    .join(' · '),
)
</script>

<template>
  <!-- Styles in assets/styles/components/cards.css. Not a link itself: the notify button is
       its own action, poster and title link to the movie page -->
  <article class="card-medium">
    <AppLink :to="movieRoute" class="poster">
      <img :src="movie.posterUrl" :alt="movie.title" loading="lazy" />
    </AppLink>
    <div class="content">
      <span class="release" v-text="releaseDate" />
      <AppLink :to="movieRoute" class="title">{{ movie.title }}</AppLink>
      <span class="details" v-text="details" />
      <span class="badge-hero badge-red" v-text="movie.ageRating.code" />
      <!-- Pressed once subscribed, there is no unsubscribe. Guests get the login modal (401) -->
      <button
        type="button"
        class="notify btn-notify"
        :class="{ success: movie.isNotified }"
        :aria-pressed="movie.isNotified"
        :disabled="movie.isNotified || isNotifying(movie)"
        @click="notify(movie)"
      >
        <IconLoader
          :name="movie.isNotified ? 'Success' : 'Bell'"
          class="text-[16px] text-primary"
        />
        <span v-text="movie.isNotified ? 'Reminder set' : 'Notify me'" />
      </button>
    </div>
  </article>
</template>
