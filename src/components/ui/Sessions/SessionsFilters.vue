<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'
import FilterGroupSkeleton from '@/components/ui/Sessions/FilterGroupSkeleton.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
import { useSessionsFiltersStore } from '@/stores/sessionsFilters'

// Option lists are loaded once at app start
const { venuesOptions, languagesOptions, timeBandsOptions, isFilterOptionsSettled } =
  storeToRefs(useFilterOptionsStore())

// Read from and written to the URL, the store applies the API's filter rules
const filtersStore = useSessionsFiltersStore()
// dates is a fixed list, not a ref, so storeToRefs would skip it
const { clearFilters, dates } = filtersStore
const { date, venues, formats, availableFormats, languages, bands, activeFiltersCount } =
  storeToRefs(filtersStore)

// API label "Morning (before 12:00)" split into "Morning" and "before 12:00" for the two tone label
function splitBandLabel(label: string) {
  const [name = '', ...rest] = label.split(' ')
  return { name, hours: rest.join(' ').replace(/^\((.*)\)$/, '$1') }
}
</script>

<template>
  <!-- Filters panel. self-start: as tall as its own content, not stretched with the results -->
  <aside class="top-6 flex flex-col gap-6 self-start rounded-2xl bg-card p-6">
    <h2 class="text-h3 text-primary capitalize" v-text="'filters'" />

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
    <div class="flex flex-col justify-between gap-3">
      <!-- Keeps the date and sort, nothing to clear while no filter is picked -->
      <button
        type="button"
        class="btn-notify py-2.25 first-letter:uppercase"
        :disabled="!activeFiltersCount"
        @click="clearFilters"
        v-text="'clear all filters'"
      />
      <!-- Picked venues, formats, languages and time bands, the date is always set -->
      <span
        class="text-center text-body-s text-secondary"
        v-text="
          activeFiltersCount + (activeFiltersCount === 1 ? ' filter' : ' filters') + ' active'
        "
      />
    </div>
  </aside>
</template>
