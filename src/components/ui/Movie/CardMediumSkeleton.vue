<script setup lang="ts">
// Placeholder for CardMedium while Coming soon loads, same size (cards.css card-medium)
withDefaults(defineProps<{ count?: number }>(), { count: 3 })
</script>

<template>
  <div
    v-for="card in count"
    :key="card"
    class="flex h-40 w-[470px] shrink-0 animate-pulse flex-row items-center gap-4.5 rounded-[20px] bg-card p-3.5"
  >
    <div class="h-33 w-34 shrink-0 rounded-[14px] bg-raised" />
    <div class="flex h-full flex-col items-start justify-between">
      <div class="h-3 w-32 rounded bg-raised" />
      <div class="h-5 w-44 rounded bg-raised" />
      <div class="h-3.5 w-52 rounded bg-raised" />
      <div class="h-6 w-10 rounded-full bg-raised" />
      <div class="h-7 w-28 rounded-full bg-raised" />
    </div>
  </div>
</template>
