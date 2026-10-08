<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import SelectInput from '@/components/form/SelectInput.vue'
import SessionCard from '@/components/ui/Sessions/SessionCard.vue'
import SessionsListSkeleton from '@/components/ui/Sessions/SessionsListSkeleton.vue'
import FilterGroupSkeleton from '@/components/ui/Sessions/FilterGroupSkeleton.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
import { useSessionsStore } from '@/stores/sessions'
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'
import { useSessionsFilters } from '@/composables/useSessionsFilters'

// Option lists are loaded once at app start
const { venuesOptions, languagesOptions, timeBandsOptions, sortsOptions, isFilterOptionsSettled } =
  storeToRefs(useFilterOptionsStore())

// Date, filters, sort and page, all read from and written to the URL
const {
  dates,
  date,
  venues,
  formats,
  availableFormats,
  languages,
  bands,
  sort,
  goToPage,
  activeFiltersCount,
  clearFilters,
  params,
} = useSessionsFilters()

// API label "Morning (before 12:00)" split into "Morning" and "before 12:00" for the two tone label
function splitBandLabel(label: string) {
  const [name = '', ...rest] = label.split(' ')
  return { name, hours: rest.join(' ').replace(/^\((.*)\)$/, '$1') }
}

const sessionsStore = useSessionsStore()
const { fetchSessions } = sessionsStore
const { groups, meta, isLoading } = storeToRefs(sessionsStore)

// Any change in the URL refetches, back and forward included. Compared by value,
// so a new but equal params object (e.g. an unrelated query key) sends no request.
// Waits for the filter options, a link is only checked against them once they are in
watch(
  () => (isFilterOptionsSettled.value ? JSON.stringify(params.value) : null),
  (key) => key && fetchSessions(params.value),
  { immediate: true },
)
</script>

<template>
  <!-- Row 1: title over the filters column. Row 2: filters and results, so both start at the same top -->
  <section class="grid grid-cols-[18.75rem_minmax(0,1fr)] gap-x-12.75 gap-y-6 px-12.75 py-10">
    <div class="col-start-1 flex flex-col gap-1.75">
      <h1 class="text-h2 text-primary capitalize" v-text="'sessions'" />
      <span class="text-body-s text-secondary" v-text="'Browse showtimes across all venues'" />
    </div>

    <!-- Filters. self-start: sticky inside its cell, which is as tall as the results -->
    <aside class="sticky top-6 col-start-1 flex flex-col gap-6 self-start rounded-2xl bg-card p-6">
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-h3 text-primary capitalize" v-text="'filters'" />
        <button
          type="button"
          class="cursor-pointer text-label-s text-helper-red first-letter:uppercase"
          @click="clearFilters"
          v-text="'clear all filters'"
        />
      </div>

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'venue'" />
        <!-- Until the filter options arrive (e.g. opened from a shared link), the lists are empty -->
        <FilterGroupSkeleton v-if="!isFilterOptionsSettled" :rows="4" />
        <label v-for="venue in venuesOptions" :key="venue.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="venue.slug" v-model="venues" />
          <span class="mark" aria-hidden="true" />
          <!-- e.g. Galleria Tbilisi · Tbilisi, the city in secondary text -->
          <span>
            <span v-text="venue.name" />
            <span class="text-body-s text-secondary" v-text="' · ' + venue.city" />
          </span>
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-68 bg-raised" />

      <!-- min-w-0: a fieldset grows to fit its content by default, so the row would never scroll -->
      <fieldset class="flex min-w-0 flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'date'" />
        <!-- Scrolls sideways with the scrollbar hidden, mouse wheel included -->
        <HorizontalScroll class="gap-1.75">
          <label v-for="day in dates" :key="day.value" class="small badge-days shrink-0">
            <input type="radio" class="sr-only" name="date" :value="day.value" v-model="date" />
            <span
              class="text-label-s text-primary capitalize"
              v-text="day.date.toLocaleDateString('en-US', { weekday: 'short' })"
            />
            <span
              class="text-h3 text-primary"
              v-text="day.date.toLocaleDateString('en-US', { day: '2-digit' })"
            />
          </label>
        </HorizontalScroll>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'format'" />
        <!-- Only the formats the picked venues have -->
        <FilterGroupSkeleton v-if="!isFilterOptionsSettled" :rows="5" />
        <label v-for="format in availableFormats" :key="format.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="format.slug" v-model="formats" />
          <span class="mark" aria-hidden="true" />
          <span v-text="format.name" />
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'language'" />
        <FilterGroupSkeleton v-if="!isFilterOptionsSettled" :rows="4" />
        <label v-for="language in languagesOptions" :key="language.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="language.slug" v-model="languages" />
          <span class="mark" aria-hidden="true" />
          <span v-text="language.name" />
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'time of day'" />
        <FilterGroupSkeleton v-if="!isFilterOptionsSettled" :rows="3" />
        <label v-for="band in timeBandsOptions" :key="band.id" class="checkbox">
          <input type="checkbox" class="sr-only" :value="band.id" v-model="bands" />
          <span class="mark" aria-hidden="true" />
          <!-- e.g. Morning · before 12:00, the hours in secondary text like the venue's city -->
          <span>
            <span v-text="splitBandLabel(band.label).name" />
            <span
              v-if="splitBandLabel(band.label).hours"
              class="text-body-s text-secondary"
              v-text="' · ' + splitBandLabel(band.label).hours"
            />
          </span>
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />
      <!-- Picked venues, formats, languages and time bands, the date is always set -->
      <span
        class="text-center text-body-s text-secondary"
        v-text="
          activeFiltersCount + (activeFiltersCount === 1 ? ' filter' : ' filters') + ' active'
        "
      />
    </aside>

    <!-- Filtered sessions, top aligned with the filters -->
    <div class="col-start-2 row-start-2 flex flex-col gap-6">
      <div class="flex flex-row items-center justify-between gap-6">
        <span
          v-if="meta"
          class="text-label-m text-primary"
          v-text="`Showing ${meta.totalSessions} sessions`"
        />
        <div v-else class="h-5 w-40 animate-pulse rounded bg-raised" />
        <!-- Sort labels come with the filter options -->
        <div v-if="!isFilterOptionsSettled" class="h-5 w-56 animate-pulse rounded bg-raised" />
        <!-- Plain picker: "Sort" prefix, the chosen order and the arrow, no field around it -->
        <SelectInput
          v-else
          v-model="sort"
          variant="plain"
          prefix="Sort"
          :options="sortsOptions.map((sort) => ({ value: sort.id, label: sort.label }))"
        />
      </div>

      <!-- Skeleton only on first load (nothing to show yet), later loads dim the current list -->
      <SessionsListSkeleton v-if="!groups" />
      <!-- One group per movie, its sessions already sorted by start time.
           The previous page stays dimmed while the next one loads -->
      <div
        v-else
        class="flex flex-col gap-8 transition-opacity duration-300"
        :class="{ 'pointer-events-none opacity-50': isLoading && groups }"
        :aria-busy="isLoading"
      >
        <template v-for="(group, index) in groups ?? []" :key="group.movie.id">
          <article class="flex flex-col justify-between gap-3.5">
            <div class="flex flex-row items-center justify-start gap-4">
              <img
                :src="group.movie.posterUrl"
                :alt="group.movie.title"
                class="h-20 w-14 shrink-0 rounded-lg object-cover"
              />
              <div class="flex flex-col justify-center gap-3">
                <div class="flex flex-row items-center justify-start gap-3">
                  <span class="text-h2 text-primary uppercase" v-text="group.movie.title" />
                  <span
                    class="badge-hero badge-red px-2! py-0.75!"
                    v-text="group.movie.ageRating.code"
                  />
                </div>
                <span
                  class="text-body-m text-secondary"
                  v-text="group.movie.runtimeMinutes + ' min'"
                />
              </div>
            </div>
            <!-- One row per movie, scrolls sideways when the cards don't fit -->
            <HorizontalScroll class="gap-3" wheel="shift">
              <SessionCard
                v-for="session in group.sessions"
                :key="session.id"
                :session="session"
                :movie="group.movie"
              />
            </HorizontalScroll>
          </article>
          <!-- divider, between groups only -->
          <div v-if="index < (groups?.length ?? 0) - 1" class="h-px w-full bg-raised" />
        </template>

        <span
          v-if="groups && !groups.length && !isLoading"
          class="text-body-m text-secondary"
          v-text="'No sessions on this date.'"
        />
      </div>

      <!-- Pages count movies, not sessions -->
      <nav
        v-if="meta && meta.lastPage > 1"
        class="flex flex-row items-center justify-center gap-2"
        aria-label="Pagination"
      >
        <button
          type="button"
          class="btn-transparent uppercase"
          :disabled="meta.currentPage <= 1 || isLoading"
          @click="goToPage(meta.currentPage - 1)"
          v-text="'previous'"
        />
        <span
          class="text-label-m text-secondary"
          v-text="meta.currentPage + ' / ' + meta.lastPage"
        />
        <button
          type="button"
          class="btn-transparent uppercase"
          :disabled="meta.currentPage >= meta.lastPage || isLoading"
          @click="goToPage(meta.currentPage + 1)"
          v-text="'next'"
        />
      </nav>
    </div>
  </section>
</template>
