<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import IconLoader from '@/components/shared/IconLoader.vue'

// YYYY-MM-DD like a native date input, so stores and the API see the same value
const model = defineModel<string | null>({ default: null })

const props = defineProps<{
  label?: string
  placeholder?: string
  // YYYY-MM-DD bounds, days outside them can't be picked
  min?: string
  max?: string
  errors?: string[]
}>()

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const YEARS_PER_PAGE = 12

const root = useTemplateRef<HTMLElement>('root')
const isOpen = ref(false)
// Days of a month, or a page of years to jump far back (dates of birth)
const view = ref<'days' | 'years'>('days')
// Month shown in the popover, month is 0 based
const viewYear = ref(0)
const viewMonth = ref(0)

const pad = (value: number) => String(value).padStart(2, '0')
const toValue = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`

// Plain numbers rather than Date, so no timezone can shift the picked day
function parse(value: string | null | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) }
}

const today = new Date()
const todayValue = toValue(today.getFullYear(), today.getMonth(), today.getDate())

// e.g. 15 Sep 2026
const display = computed(() => {
  const date = parse(model.value)
  if (!date) return null
  return `${date.day} ${MONTHS[date.month]!.slice(0, 3)} ${date.year}`
})

// Monday first, leading blanks pad the first week
const days = computed(() => {
  const firstWeekday = (new Date(viewYear.value, viewMonth.value, 1).getDay() + 6) % 7
  const count = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: count }, (_, index) => {
      const value = toValue(viewYear.value, viewMonth.value, index + 1)
      return {
        day: index + 1,
        value,
        isSelected: value === model.value,
        isToday: value === todayValue,
        // Same length strings, so they compare as dates
        isDisabled: (!!props.min && value < props.min) || (!!props.max && value > props.max),
      }
    }),
  ]
})

const yearsPageStart = computed(
  () => viewYear.value - (((viewYear.value % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE),
)
const years = computed(() =>
  Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearsPageStart.value + index),
)

const title = computed(() =>
  view.value === 'days'
    ? `${MONTHS[viewMonth.value]} ${viewYear.value}`
    : `${yearsPageStart.value} – ${yearsPageStart.value + YEARS_PER_PAGE - 1}`,
)

// Opens on the picked month, else today's
function open() {
  const date = parse(model.value) ?? parse(todayValue)!
  viewYear.value = date.year
  viewMonth.value = date.month
  view.value = 'days'
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

// Arrows step a month, or a page of years
function step(direction: -1 | 1) {
  if (view.value === 'years') {
    viewYear.value += direction * YEARS_PER_PAGE
    return
  }
  const month = viewMonth.value + direction
  viewYear.value += Math.floor(month / 12)
  viewMonth.value = (month + 12) % 12
}

function pickYear(year: number) {
  viewYear.value = year
  view.value = 'days'
}

function pickDay(value: string) {
  model.value = value
  close()
}

onClickOutside(root, close)
onKeyStroke('Escape', () => isOpen.value && close())
</script>

<template>
  <div ref="root" class="input-group relative w-full">
    <label v-if="label" v-text="label" :class="{ 'text-helper-red!': errors && errors.length }" />
    <div class="text-input">
      <!-- Looks like TextInput's input, opens the calendar instead of the browser's picker -->
      <button
        type="button"
        class="flex h-10 w-full cursor-pointer items-center rounded-xl border border-transparent bg-card px-4 text-left text-label-s text-secondary hover:border-disabled hover:bg-raised focus:border-disabled focus:outline-none"
        :class="[
          { 'border-helper-red! text-helper-red!': errors && errors.length },
          { 'border-disabled bg-card': isOpen },
        ]"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        @click="isOpen ? close() : open()"
        v-text="display ?? placeholder ?? ''"
      />
      <span
        class="suffix pointer-events-none"
        :class="errors && errors.length ? 'text-helper-red' : 'text-secondary'"
      >
        <IconLoader name="Calendar" class="text-[16px]" />
      </span>
    </div>

    <div
      v-if="isOpen"
      role="dialog"
      class="absolute top-full left-0 z-20 mt-2 flex w-75 flex-col gap-3 rounded-2xl border border-raised bg-page p-4"
    >
      <div class="flex flex-row items-center justify-between">
        <button
          type="button"
          class="flex size-8 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-raised"
          aria-label="Previous"
          @click="step(-1)"
        >
          <IconLoader name="Arrow" class="rotate-90 text-[16px]" />
        </button>
        <!-- Title switches to a year grid, dates of birth are years back -->
        <button
          type="button"
          class="cursor-pointer rounded-full px-3 py-1 text-button text-primary hover:bg-raised"
          @click="view = view === 'days' ? 'years' : 'days'"
          v-text="title"
        />
        <button
          type="button"
          class="flex size-8 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-raised"
          aria-label="Next"
          @click="step(1)"
        >
          <IconLoader name="Arrow" class="-rotate-90 text-[16px]" />
        </button>
      </div>

      <div v-if="view === 'days'" class="grid grid-cols-7 gap-1">
        <span
          v-for="weekday in WEEKDAYS"
          :key="weekday"
          class="flex h-8 items-center justify-center text-overline text-secondary uppercase"
          v-text="weekday"
        />
        <template v-for="(item, index) in days" :key="item?.value ?? 'blank-' + index">
          <span v-if="!item" />
          <button
            v-else
            type="button"
            class="flex size-8 cursor-pointer items-center justify-center rounded-full text-label-s text-primary hover:bg-raised disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent"
            :class="[
              { 'bg-helper-red! text-primary': item.isSelected },
              { 'border border-disabled': item.isToday && !item.isSelected },
            ]"
            :disabled="item.isDisabled"
            @click="pickDay(item.value)"
            v-text="item.day"
          />
        </template>
      </div>

      <div v-else class="grid grid-cols-3 gap-2">
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="h-10 cursor-pointer rounded-full text-label-s text-primary hover:bg-raised"
          :class="{ 'bg-helper-red!': year === viewYear }"
          @click="pickYear(year)"
          v-text="year"
        />
      </div>
    </div>

    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-label-s text-helper-red" v-text="error" />
    </div>
  </div>
</template>
