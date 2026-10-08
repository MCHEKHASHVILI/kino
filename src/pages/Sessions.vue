<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SelectInput from '@/components/form/SelectInput.vue'
import SessionCard from '@/components/ui/Sessions/SessionCard.vue'
import SessionsListSkeleton from '@/components/ui/Sessions/SessionsListSkeleton.vue'
import SessionsFilters from '@/components/ui/Sessions/SessionsFilters.vue'
import HorizontalScroll from '@/components/shared/HorizontalScroll.vue'
import BasePagination from '@/components/shared/BasePagination.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
import { useSessionsStore } from '@/stores/sessions'
import { useSessionsFiltersStore } from '@/stores/sessionsFilters'

// Option lists are loaded once at app start
const { sortsOptions, isFilterOptionsSettled } = storeToRefs(useFilterOptionsStore())

// Sort, page and the request params, read from and written to the URL by the filters store
const filtersStore = useSessionsFiltersStore()
const { goToPage } = filtersStore
const { sort, params } = storeToRefs(filtersStore)

const sessionsStore = useSessionsStore()
const { fetchSessions } = sessionsStore
const { groups, meta, isLoading } = storeToRefs(sessionsStore)

const results = useTemplateRef<HTMLElement>('results')
// Only the page changed (pager, back / forward): a whole different set of films is coming,
// so the list shows the skeleton instead of dimming the old page
const isPageSwitch = ref(false)

// Same params apart from the page
function onlyPageChanged(key: string, previous: string) {
  const withoutPage = (value: string) => JSON.stringify({ ...JSON.parse(value), page: 0 })
  return withoutPage(key) === withoutPage(previous)
}

// Any change in the URL refetches, back and forward included. Compared by value,
// so a new but equal params object (e.g. an unrelated query key) sends no request.
// Waits for the filter options, a link is only checked against them once they are in
watch(
  () => (isFilterOptionsSettled.value ? JSON.stringify(params.value) : null),
  (key, previous) => {
    if (!key) return
    isPageSwitch.value = !!previous && onlyPageChanged(key, previous)
    if (isPageSwitch.value) startPageSwitch()
    fetchSessions(params.value)
  },
  { immediate: true },
)

/**
 * Results keep their height while switching pages. Otherwise the shorter skeleton (and then a
 * page of a different length) would cut the smooth scroll short and make the sticky filters
 * jump with the row. Released once the new page is in and the scroll has settled
 */
const lockedHeight = ref<number | null>(null)
let isScrolling = false
let switchId = 0

function releaseLock() {
  if (!isScrolling && !isLoading.value) lockedHeight.value = null
}

function startPageSwitch() {
  const id = ++switchId
  lockedHeight.value = results.value?.offsetHeight ?? null
  isScrolling = true
  // The pager is at the bottom of a long list, the new page starts at the top
  results.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // scrollend where supported, a timeout as well (no scroll happens when already in place)
  const settled = () => {
    if (id !== switchId) return
    isScrolling = false
    releaseLock()
  }
  window.addEventListener('scrollend', settled, { once: true })
  setTimeout(settled, 1000)
}

// Skeleton until the new page is in
watch(isLoading, (loading) => {
  if (loading) return
  isPageSwitch.value = false
  releaseLock()
})
</script>

<template>
  <!-- Row 1: title over the filters column. Row 2: filters and results, so both start at the same top -->
  <section class="grid grid-cols-[18.75rem_minmax(0,1fr)] gap-x-12.75 gap-y-6 px-12.75">
    <div class="col-start-1 flex flex-col gap-1.75">
      <h1 class="text-h2 text-primary capitalize" v-text="'sessions'" />
      <span class="text-body-s text-secondary" v-text="'Browse showtimes across all venues'" />
    </div>

    <!-- Filters panel, its state lives in the sessions filters store -->
    <SessionsFilters class="col-start-1" />

    <!-- Filtered sessions, top aligned with the filters -->
    <!-- At least as tall as the filters, so a short page doesn't collapse the row under them -->
    <div
      ref="results"
      class="col-start-2 row-start-2 flex min-h-[calc(100dvh-3rem)] scroll-mt-6 flex-col gap-6"
      :style="lockedHeight ? { minHeight: lockedHeight + 'px' } : undefined"
    >
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

      <!-- First load, or switching pages. Filter, date and sort changes dim the current list instead -->
      <SessionsListSkeleton v-if="!groups || (isPageSwitch && isLoading)" />
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
      <BasePagination
        v-if="meta && meta.lastPage > 1"
        :current="meta.currentPage"
        :last="meta.lastPage"
        :disabled="isLoading"
        @change="goToPage"
      />
    </div>
  </section>
</template>
