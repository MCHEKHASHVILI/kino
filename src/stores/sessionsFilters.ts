import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { LocationQueryValue } from 'vue-router'
import type { SessionsParams } from '@types'
import router from '@/router'
import { useFilterOptionsStore } from './filterOptions'

type ListKey = 'venues' | 'formats' | 'languages' | 'bands'

// API's sort when none is sent (showtime, earliest first)
const DEFAULT_SORT = 'time_asc'

// Singular, comma separated in the URL (venue=galleria,batumi), the request still sends venues[]=…
const URL_KEYS: Record<ListKey, string> = {
  venues: 'venue',
  formats: 'format',
  languages: 'language',
  bands: 'band',
}

// Local calendar day as YYYY-MM-DD, what the API's date parameter takes
function toDateValue(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
}

// "galleria,batumi" → ['galleria', 'batumi'], a repeated key (venue=a&venue=b) is read too
function toList(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((item) => item?.split(',') ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Sessions page state: date, filters, sort and page. The URL is the source of truth
 * (API: the whole view belongs in the address bar, so deep links, refreshes and back and forward
 * work), e.g. /sessions?venue=galleria,batumi&date=2026-11-14&format=max&sort=price_asc&page=2
 * This store reads it and writes it, shared by the filters panel and the page (sort, pager, fetch).
 * Values the filter options don't know (old or edited links) are ignored
 */
export const useSessionsFiltersStore = defineStore('sessionsFilters', () => {
  const { venuesOptions, formatsOptions, languagesOptions, timeBandsOptions, sortsOptions } =
    storeToRefs(useFilterOptionsStore())

  const query = computed(() => router.currentRoute.value.query)

  // Valid values per filter, empty until the options load, then unknown values are dropped
  const known: Record<ListKey, () => string[]> = {
    venues: () => venuesOptions.value.map((venue) => venue.slug),
    formats: () => formatsOptions.value.map((format) => format.slug),
    languages: () => languagesOptions.value.map((language) => language.slug),
    bands: () => timeBandsOptions.value.map((band) => band.id),
  }

  // Today and the six days after it, one date is always in play (API: date defaults to today)
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return { value: toDateValue(date), date }
  })

  /**
   * API rule 1: changing any filter or the sort resets page to 1, so every change here drops it.
   * Filters and sort replace the history entry, only the pager adds one
   */
  function replaceQuery(changes: Record<string, string | undefined>) {
    router.replace({ query: { ...query.value, page: undefined, ...changes } })
  }

  // Empty lists leave the URL instead of showing up as an empty key
  const listChange = (key: ListKey, value: string[]) => ({
    [URL_KEYS[key]]: value.length ? value.join(',') : undefined,
  })

  function listFilter(key: ListKey) {
    return computed<string[]>({
      get: () => {
        const values = toList(query.value[URL_KEYS[key]])
        const valid = known[key]()
        return valid.length ? values.filter((value) => valid.includes(value)) : values
      },
      set: (value) => replaceQuery(listChange(key, value)),
    })
  }

  const date = computed<string>({
    get: () => {
      const value = query.value.date
      return dates.some((day) => day.value === value) ? (value as string) : dates[0]!.value
    },
    // First day is the default, it stays out of the URL
    set: (value) => replaceQuery({ date: value === dates[0]!.value ? undefined : value }),
  })

  const selectedVenues = listFilter('venues')
  const selectedFormats = listFilter('formats')
  const languages = listFilter('languages')
  const bands = listFilter('bands')

  /**
   * API rule 2: picked venues narrow the format list to the formats they actually have
   * (venue.formats), and selected formats they don't have are dropped.
   */
  function formatsOf(venueSlugs: string[]) {
    return new Set(
      venuesOptions.value
        .filter((venue) => venueSlugs.includes(venue.slug))
        .flatMap((venue) => venue.formats.map((format) => format.slug)),
    )
  }

  // Every format when no venue is picked (or the options failed to load, nothing dropped blindly)
  const availableFormats = computed(() => {
    if (!selectedVenues.value.length || !venuesOptions.value.length) return formatsOptions.value
    const slugs = formatsOf(selectedVenues.value)
    return formatsOptions.value.filter((format) => slugs.has(format.slug))
  })

  // Picking venues drops the selected formats they don't have, in the same URL update
  const venues = computed<string[]>({
    get: () => selectedVenues.value,
    set: (value) => {
      const slugs = formatsOf(value)
      const formats = value.length
        ? selectedFormats.value.filter((slug) => slugs.has(slug))
        : selectedFormats.value
      replaceQuery({ ...listChange('venues', value), ...listChange('formats', formats) })
    },
  })

  // A format from an old link that the picked venues don't have is ignored
  const formats = computed<string[]>({
    get: () =>
      formatsOptions.value.length
        ? selectedFormats.value.filter((slug) =>
            availableFormats.value.some((format) => format.slug === slug),
          )
        : selectedFormats.value,
    set: (value) => (selectedFormats.value = value),
  })

  // Always a value so the sort picker shows a label. The API default stays out of the URL
  // and the request, an unknown sort counts as the default
  const sort = computed<string>({
    get: () => {
      const value = query.value.sort
      if (typeof value !== 'string') return DEFAULT_SORT
      const valid = sortsOptions.value.map((option) => option.id)
      return !valid.length || valid.includes(value) ? value : DEFAULT_SORT
    },
    set: (value) => replaceQuery({ sort: value === DEFAULT_SORT ? undefined : value }),
  })

  // Whole numbers from 1, anything else is page 1 (which stays out of the URL)
  const page = computed(() => {
    const value = Number(query.value.page)
    return Number.isInteger(value) && value > 1 ? value : 1
  })

  // Only the pager adds history, so back goes to the previous page
  function goToPage(value: number) {
    router.push({ query: { ...query.value, page: value === 1 ? undefined : String(value) } })
  }

  const activeFiltersCount = computed(
    () => venues.value.length + formats.value.length + languages.value.length + bands.value.length,
  )

  // Date and sort are not filters, they stay
  function clearFilters() {
    replaceQuery({
      ...listChange('venues', []),
      ...listChange('formats', []),
      ...listChange('languages', []),
      ...listChange('bands', []),
    })
  }

  // Everything GET /sessions needs, empty lists and the default sort are left out
  const params = computed<SessionsParams>(() => ({
    date: date.value,
    page: page.value,
    ...(sort.value !== DEFAULT_SORT ? { sort: sort.value } : {}),
    ...(venues.value.length ? { venues: venues.value } : {}),
    ...(formats.value.length ? { formats: formats.value } : {}),
    ...(languages.value.length ? { languages: languages.value } : {}),
    ...(bands.value.length ? { bands: bands.value } : {}),
  }))

  return {
    dates,
    date,
    venues,
    formats,
    availableFormats,
    languages,
    bands,
    sort,
    page,
    goToPage,
    activeFiltersCount,
    clearFilters,
    params,
  }
})
