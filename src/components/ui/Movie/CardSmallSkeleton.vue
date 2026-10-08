<script setup lang="ts">
// Placeholder for CardSmall, same size (cards.css card-small). Recently viewed reads the browser's
// storage and never waits, kept for lists of small cards that do load
withDefaults(defineProps<{ count?: number }>(), { count: 4 })
</script>

<template>
  <div
    v-for="card in count"
    :key="card"
    class="flex w-82.5 shrink-0 animate-pulse flex-row gap-3 rounded-2xl bg-card p-2.5"
  >
    <div class="aspect-67/87 w-16.75 shrink-0 rounded-lg bg-raised" />
    <div class="flex flex-col justify-center gap-2">
      <div class="h-4 w-36 rounded bg-raised" />
      <div class="h-3.5 w-44 rounded bg-raised" />
      <div class="h-6 w-10 rounded-full bg-raised" />
    </div>
  </div>
</template>
