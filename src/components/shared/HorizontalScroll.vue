<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useHorizontalWheel } from '@/composables/useHorizontalWheel'
import { useDragScroll } from '@/composables/useDragScroll'

/**
 * One row that scrolls sideways: hidden scrollbar, mouse drag, and a smooth mouse wheel.
 * Spacing (gap) comes from the parent's class, children should not shrink (shrink-0)
 */
const props = withDefaults(
  defineProps<{
    // always: the plain wheel scrolls the row. shift: only Shift+wheel does,
    // so rows inside a long list never catch the page scroll
    wheel?: 'always' | 'shift'
  }>(),
  { wheel: 'always' },
)

const row = useTemplateRef<HTMLElement>('row')
const { stop } = useHorizontalWheel(row, { requireShift: props.wheel === 'shift' })
// A drag takes over from a wheel glide still running
const { isDragging } = useDragScroll(row, stop)
</script>

<template>
  <!-- Grab cursor while dragging, on the cards too (they have their own pointer cursor) -->
  <div
    ref="row"
    class="no-scrollbar flex min-w-0 flex-row flex-nowrap overflow-x-auto"
    :class="{ 'cursor-grabbing select-none **:cursor-grabbing!': isDragging }"
  >
    <slot />
  </div>
</template>
