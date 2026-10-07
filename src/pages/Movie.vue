<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMovieStore } from '@/stores/movie'
import { useBookingStore } from '@/stores/booking'
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import SessionDatesSkeleton from '@/components/ui/MovieSessions/SessionDatesSkeleton.vue'
import VenueSessionsSkeleton from '@/components/ui/MovieSessions/VenueSessionsSkeleton.vue'

const props = defineProps<{ slug: string }>()
const movieStore = useMovieStore()
const { fetchMovie, groupVenueSessionsByHalls } = movieStore
const { selectSession } = useBookingStore()
const { movie, sessionDate, movieSessions, isMovieLoading, isSessionsLoading } =
  storeToRefs(movieStore)

// Component is reused when navigating between movies, so refetch on slug change
watch(() => props.slug, fetchMovie, { immediate: true })
</script>

<template>
  <section class="flex flex-col gap-8.5">
    <div class="relative pt-38 pb-10.25">
      <!-- Backdrop: full width breakout from wrapper, header overlays it (route meta overlayHeader) -->
      <section
        class="absolute inset-y-0 left-1/2 h-141.75 w-screen -translate-x-1/2 overflow-hidden"
      >
        <template v-if="movie">
          <img
            :src="movie.backdropUrl"
            alt=""
            fetchpriority="high"
            class="absolute inset-0 size-full object-cover object-top"
          />
          <div class="absolute inset-0 bg-overlay-scrim backdrop-blur-[10px]" />
        </template>
        <div v-else class="absolute inset-0 animate-pulse bg-raised" />
      </section>

      <!-- Content overlaps the bottom of the backdrop -->
      <div class="relative z-10 ml-15">
        <template v-if="movie">
          <div class="flex flex-row items-end justify-start gap-8.5">
            <div class="h-93.5 w-72.25 rounded-[14px]">
              <img :src="movie.posterUrl" class="content-cover h-93.5 w-72.25 rounded-[14px]" />
            </div>
            <div class="flex w-145 flex-col gap-3.75 py-2.25">
              <span
                v-if="!movie.isComingSoon"
                class="badge-hero badge-red uppercase"
                v-text="'now playing'"
              />
              <span
                v-else
                class="badge-hero badge-red uppercase"
                v-text="
                  'premiere · WEEK OF ' +
                  new Date(movie.releaseDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                "
              />
              <div class="flex flex-col justify-between gap-5">
                <span class="text-display text-primary uppercase" v-text="movie.title" />
                <span class="text-body-m text-primary" v-text="movie.synopsis" />
                <div class="flex flex-row items-center justify-start gap-1">
                  <span class="badge-hero badge-red" v-text="movie.ageRating.code" />
                  <div class="badge-hero badge-default">
                    <IconLoader name="Timer" class="text-14px" />
                    <span v-text="movie.runtimeMinutes" />
                    <span class="capitalize" v-text="'min'" />
                  </div>
                  <span
                    v-for="format in movie.formats"
                    class="badge-hero badge-default uppercase"
                    v-text="format.name"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="flex flex-row gap-2.5 px-12.75">
      <div class="flex w-full flex-col gap-6.75">
        <div class="flex flex-col gap-3.5">
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-h2 text-primary capitalize">sessions</span>
            <!-- <span class="text-body-s text-secondary">22 sessions over the next seven days</span> -->
          </div>
          <SessionDatesSkeleton v-if="isMovieLoading" />
          <template v-else-if="movie">
            <div class="flex flex-row gap-1.75">
              <label v-for="date in movie.availableDates.slice(0, 7)" class="badge-days">
                <input
                  type="radio"
                  class="sr-only"
                  v-model="sessionDate"
                  :value="date"
                  name="sessionDate"
                />
                <span class="text-label-s text-primary capitalize">{{
                  new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
                }}</span>
                <span class="text-h3 text-primary">{{
                  new Date(date).toLocaleDateString('en-US', { day: '2-digit' })
                }}</span>
              </label>
            </div>
          </template>
        </div>
        <!-- Skeleton only on first load, date switches keep the previous list dimmed -->
        <VenueSessionsSkeleton v-if="isSessionsLoading && !movieSessions" />
        <div
          v-else-if="movieSessions"
          class="flex flex-col gap-6.75 transition-opacity duration-300"
          :class="{ 'pointer-events-none opacity-50': isSessionsLoading }"
          :aria-busy="isSessionsLoading"
        >
          <div v-for="movieSession in movieSessions" class="flex flex-col gap-4">
            <span class="text-button text-primary capitalize" v-text="movieSession.venue.name" />
            <div class="flex flex-row items-center justify-start gap-2.5">
              <div
                v-for="hall in groupVenueSessionsByHalls(movieSession.sessions)"
                class="flex flex-col justify-start gap-2.25 rounded-[18px] bg-card p-3.75"
              >
                <span class="text-primary" v-text="'Hall ' + hall.hall.name" />
                <div class="flex flex-row justify-between gap-2.25">
                  <div v-for="session in hall.sessions">
                    <AppLink
                      :to="{ name: 'action.modal', params: { name: 'BookingModal' } }"
                      @click="selectSession(session)"
                      class="badge-ticket"
                    >
                      <!-- Left: time + tags -->
                      <div class="flex w-31 flex-col items-center justify-center gap-2 py-3.75">
                        <span class="text-h2 text-primary" v-text="session.time" />
                        <div class="flex items-center gap-1.5">
                          <span
                            class="text-body-s text-secondary uppercase"
                            v-text="session.language.code"
                          />
                          <span class="badge-default uppercase" v-text="session.format.name" />
                        </div>
                      </div>
                      <!-- Divider with notches -->
                      <div
                        class="relative my-2 w-px bg-[linear-gradient(to_bottom,currentColor_50%,transparent_50%)] bg-size-[1px_8px] bg-center bg-repeat-y text-primary"
                      >
                        <span
                          class="absolute -top-3.25 left-[-5.6px] h-3 w-3 rounded-full bg-card"
                        ></span>
                        <span
                          class="absolute -bottom-3.25 left-[-5.6px] h-3 w-3 rounded-full bg-card"
                        ></span>
                      </div>

                      <!-- Right: price + seats -->
                      <div
                        v-if="!session.isSoldOut"
                        class="flex w-20.75 flex-col items-center justify-center gap-2 px-2.5 py-3.75"
                      >
                        <span class="text-h3 text-helper-red" v-text="'₾ ' + session.price" />
                        <div class="flex flex-row items-baseline justify-center gap-1">
                          <IconLoader name="Ticket" class="text-body-s text-secondary" />
                          <span
                            class="text-body-s text-secondary"
                            v-text="session.seatsLeft + ' left'"
                          />
                        </div>
                      </div>
                      <div
                        v-else
                        class="flex w-20.75 flex-col items-center justify-center gap-2 px-2.5 py-3.75"
                      >
                        <IconLoader name="Error" class="text-h3 text-helper-red" />
                        <span class="badge-red text-nowrap" v-text="'Sold out'" />
                      </div>
                    </AppLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-110.25 flex-col gap-4.25 rounded-[20px] px-6.5">
        <template v-if="movie">
          <h2 class="text-h2 text-primary capitalize" v-text="'details'" />
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'director'" />
            <span class="text-label-m text-primary capitalize" v-text="movie.director" />
          </div>
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'main cast'" />
            <span class="text-label-m text-primary capitalize" v-text="movie.cast" />
          </div>
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'duration'" />
            <span class="text-label-m text-primary" v-text="movie.runtimeMinutes + ' minutes'" />
          </div>
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'release date'" />
            <span
              class="text-label-m text-primary"
              v-text="
                new Date(movie.releaseDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              "
            />
          </div>
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'formats'" />
            <div class="flex">
              <span
                v-for="format in movie.formats"
                class="text-label-m text-primary"
                v-text="
                  format.name +
                  (movie.formats.indexOf(format) < movie.formats.length - 1 ? ',&nbsp' : '')
                "
              />
            </div>
          </div>
          <div class="flex flex-col justify-between gap-1.75">
            <span class="text-label-s text-secondary uppercase" v-text="'from'" />
            <span class="text-label-m text-primary" v-text="'₾' + movie.fromPrice" />
          </div>
          <div
            class="flex flex-col justify-between gap-1.75 rounded-xl bg-tint-warning px-3.25 py-2.25"
          >
            <span class="text-label-s text-helper-orange uppercase" v-text="'rating note'" />
            <div class="flex flex-row items-start justify-start gap-1.75">
              <div class="w-5.5 text-label-s text-helper-orange" v-text="movie.ageRating.code" />
              <div
                class="w-full text-body-s text-helper-orange"
                v-text="movie.ageRating.description"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
