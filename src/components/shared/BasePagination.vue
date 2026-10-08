<script setup lang="ts">
import { computed } from 'vue'
import IconLoader from '@/components/shared/IconLoader.vue'

const props = defineProps<{
  current: number
  last: number
  // e.g. while the next page loads
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [page: number] }>()

/**
 * Page numbers with gaps, e.g. 1 2 3 … 10 / 1 … 4 5 6 … 10 / 1 … 8 9 10.
 * Always the first and last page and the current one with its neighbours,
 * near either end the first / last three. A gap of one page shows that page, not "…"
 */
const items = computed<(number | 'gap')[]>(() => {
  const { current, last } = props
  const pages = new Set([1, last, current - 1, current, current + 1])
  if (current <= 2) [2, 3].forEach((page) => pages.add(page))
  if (current >= last - 1) [last - 1, last - 2].forEach((page) => pages.add(page))

  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1]
    if (previous === undefined || page - previous === 1) return [page]
    // One page missing: show it, a "…" would take the same space
    return page - previous === 2 ? [page - 1, page] : ['gap' as const, page]
  })
})

function go(page: number) {
  if (props.disabled || page < 1 || page > props.last || page === props.current) return
  emit('change', page)
}
</script>

<template>
  <nav class="flex flex-row items-center justify-center gap-1" aria-label="Pagination">
    <button
      type="button"
      class="btn-page"
      aria-label="Previous page"
      :disabled="disabled || current <= 1"
      @click="go(current - 1)"
    >
      <IconLoader name="ChevronLeft" class="text-[16px]" />
    </button>

    <template v-for="(item, index) in items" :key="item === 'gap' ? 'gap-' + index : item">
      <span
        v-if="item === 'gap'"
        class="flex size-10 items-center justify-center text-label-m text-secondary"
        aria-hidden="true"
        v-text="'…'"
      />
      <button
        v-else
        type="button"
        class="btn-page"
        :aria-current="item === current ? 'page' : undefined"
        :aria-label="'Page ' + item"
        :disabled="disabled && item !== current"
        @click="go(item)"
        v-text="item"
      />
    </template>

    <button
      type="button"
      class="btn-page"
      aria-label="Next page"
      :disabled="disabled || current >= last"
      @click="go(current + 1)"
    >
      <IconLoader name="ChevronLeft" class="rotate-180 text-[16px]" />
    </button>
  </nav>
</template>
