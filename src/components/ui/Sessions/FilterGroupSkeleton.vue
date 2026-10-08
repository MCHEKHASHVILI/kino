<script setup lang="ts">
// Checkbox rows of one filter group, shown while the filter options load (e.g. a shared link)
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })

// Varied label widths so the rows don't look like a block
const WIDTHS = ['w-32', 'w-24', 'w-36', 'w-20', 'w-28']
</script>
<template>
  <div class="flex animate-pulse flex-col gap-3" aria-hidden="true">
    <!-- Same size as the checkbox utility: 18px box, 10px gap, one line of text -->
    <div v-for="row in rows" :key="row" class="flex h-5 flex-row items-center gap-2.5">
      <div class="size-4.5 shrink-0 rounded-[5px] bg-raised" />
      <div class="h-3.5 rounded bg-raised" :class="WIDTHS[(row - 1) % WIDTHS.length]" />
    </div>
  </div>
</template>
