<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import SelectInput from '@/components/form/SelectInput.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
import { useHorizontalWheel } from '@/composables/useHorizontalWheel'

// Option lists are loaded once at app start, filtering itself is not wired up yet
const { venuesOptions, formatsOptions, languagesOptions, timeBandsOptions, sortsOptions } =
  storeToRefs(useFilterOptionsStore())

// One date at a time (API: date defaults to today), the next seven days to pick from
const dates = Array.from({ length: 7 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() + index)
  return date
})

// API label "Morning (before 12:00)" split into "Morning" and "before 12:00" for the two tone label
function splitBandLabel(label: string) {
  const [name = '', ...rest] = label.split(' ')
  return { name, hours: rest.join(' ').replace(/^\((.*)\)$/, '$1') }
}

// Mouse wheel scrolls the dates sideways while the cursor is over them
useHorizontalWheel(useTemplateRef<HTMLElement>('datesRow'))
</script>

<template>
  <!-- Row 1: title over the filters column. Row 2: filters and results, so both start at the same top -->
  <section class="grid grid-cols-[18.75rem_minmax(0,1fr)] gap-x-8 gap-y-6 px-12.75 py-10">
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
          v-text="'clear all filters'"
        />
      </div>

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'venue'" />
        <label v-for="venue in venuesOptions" :key="venue.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="venue.slug" />
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
        <!-- Scrolls sideways with the scrollbar hidden -->
        <div ref="datesRow" class="no-scrollbar flex flex-row flex-nowrap gap-1.75 overflow-x-auto">
          <label v-for="date in dates" :key="date.toDateString()" class="small badge-days shrink-0">
            <input type="radio" class="sr-only" name="date" />
            <span
              class="text-label-s text-primary capitalize"
              v-text="date.toLocaleDateString('en-US', { weekday: 'short' })"
            />
            <span
              class="text-h3 text-primary"
              v-text="date.toLocaleDateString('en-US', { day: '2-digit' })"
            />
          </label>
        </div>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'format'" />
        <label v-for="format in formatsOptions" :key="format.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="format.slug" />
          <span class="mark" aria-hidden="true" />
          <span v-text="format.name" />
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'language'" />
        <label v-for="language in languagesOptions" :key="language.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="language.slug" />
          <span class="mark" aria-hidden="true" />
          <span v-text="language.name" />
        </label>
      </fieldset>

      <!-- divider -->
      <div class="h-px w-full bg-raised" />

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'time of day'" />
        <label v-for="band in timeBandsOptions" :key="band.id" class="checkbox">
          <input type="checkbox" class="sr-only" :value="band.id" />
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
      <!-- Picked venues, formats, languages and time bands once filtering is wired up -->
      <span class="text-center text-body-s text-secondary" v-text="'0 filters active'" />
    </aside>

    <!-- Filtered sessions, top aligned with the filters -->
    <div class="col-start-2 row-start-2 flex flex-col gap-6">
      <div class="flex flex-row items-center justify-between gap-6">
        <!-- meta.totalSessions -->
        <span class="text-label-m text-primary" v-text="'Showing 12 sessions'" />
        <div class="w-60">
          <SelectInput
            :model-value="null"
            :options="sortsOptions.map((sort) => ({ value: sort.id, label: sort.label }))"
            placeholder="Sort by"
          />
        </div>
      </div>

      <!-- One group per movie, its sessions already sorted by start time -->
      <div class="flex flex-col gap-4">
        <article class="flex flex-row gap-5 rounded-[26px] bg-card p-5">
          <div class="h-33.5 w-25 shrink-0 rounded-[10px] bg-raised">
            <!-- movie.posterUrl -->
          </div>
          <div class="flex min-w-0 grow flex-col gap-4">
            <div class="flex flex-row items-center gap-2.5">
              <span class="text-h2 text-primary uppercase" v-text="'movie title'" />
              <span class="badge-hero badge-red px-2! py-0.75!" v-text="'PG'" />
              <span class="text-body-m text-secondary" v-text="'120 min'" />
            </div>
            <!-- Session tickets, same badge-ticket as the movie page. Sold out stays visible, disabled -->
            <div class="flex flex-row flex-wrap gap-2.25">
              <div class="flex h-19.5 w-52 rounded-2xl bg-page" />
              <div class="flex h-19.5 w-52 rounded-2xl bg-page" />
              <div class="flex h-19.5 w-52 rounded-2xl bg-page" />
            </div>
          </div>
        </article>
      </div>

      <!-- Pages count movies, not sessions (meta.lastPage) -->
      <nav class="flex flex-row items-center justify-center gap-2" aria-label="Pagination">
        <button type="button" class="btn-transparent uppercase" v-text="'previous'" />
        <span class="text-label-m text-secondary" v-text="'1 / 1'" />
        <button type="button" class="btn-transparent uppercase" v-text="'next'" />
      </nav>
    </div>
  </section>
</template>
