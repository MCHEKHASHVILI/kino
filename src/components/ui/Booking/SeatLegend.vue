<script setup lang="ts">
// Swatch classes match the seat states drawn by SeatMap (badge.css)
const items = [
  { label: 'available', state: '' },
  { label: 'selected', state: 'is-checked' },
  { label: 'sold', state: 'is-sold' },
  { label: 'held by another user', state: 'is-held' },
]
</script>

<template>
  <div class="flex flex-row items-center justify-center gap-6">
    <div
      v-for="item in items"
      :key="item.label"
      class="flex flex-row items-center justify-between gap-2"
    >
      <span class="badge-seat h-4 w-4 rounded-[5px]" :class="item.state" />
      <span class="text-body-s text-secondary first-letter:uppercase" v-text="item.label" />
    </div>
  </div>
</template>
