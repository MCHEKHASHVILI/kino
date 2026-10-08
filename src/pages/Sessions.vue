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

// Mouse wheel scrolls the dates sideways while the cursor is over them
useHorizontalWheel(useTemplateRef<HTMLElement>('datesRow'))
</script>

<template>
  <section class="flex flex-row items-start gap-8 px-12.75 py-10">
    <!-- Filters -->
    <aside class="sticky top-6 flex w-75 shrink-0 flex-col gap-6 rounded-[20px] bg-card p-5">
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-h3 text-primary capitalize" v-text="'filters'" />
        <button
          type="button"
          class="cursor-pointer text-label-s text-helper-red uppercase"
          v-text="'reset'"
        />
      </div>

      <fieldset class="flex flex-col gap-2.5">
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

      <fieldset class="flex flex-col gap-2.5">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'format'" />
        <label v-for="format in formatsOptions" :key="format.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="format.slug" />
          <span class="mark" aria-hidden="true" />
          <span v-text="format.name" />
        </label>
      </fieldset>

      <fieldset class="flex flex-col gap-2.5">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'language'" />
        <label v-for="language in languagesOptions" :key="language.slug" class="checkbox">
          <input type="checkbox" class="sr-only" :value="language.slug" />
          <span class="mark" aria-hidden="true" />
          <span v-text="language.name" />
        </label>
      </fieldset>

      <fieldset class="flex flex-col gap-2.5">
        <legend class="mb-3 text-label-s text-secondary uppercase" v-text="'time of day'" />
        <label v-for="band in timeBandsOptions" :key="band.id" class="checkbox">
          <input type="checkbox" class="sr-only" :value="band.id" />
          <span class="mark" aria-hidden="true" />
          <span v-text="band.label" />
        </label>
      </fieldset>
    </aside>

    <!-- Filtered sessions -->
    <div class="flex min-w-0 grow flex-col gap-6">
      <div class="flex flex-row items-end justify-between gap-6">
        <div class="flex flex-col gap-1.75">
          <h1 class="text-h2 text-primary capitalize" v-text="'sessions'" />
          <!-- meta.totalSessions -->
          <span class="text-body-s text-secondary" v-text="'Showing 0 sessions'" />
        </div>
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
