<script setup lang="ts">
// Placeholder for CardBig while Now playing loads, same slot and panel size (cards.css card-big)
withDefaults(defineProps<{ count?: number }>(), { count: 5 })
</script>

<template>
  <div v-for="card in count" :key="card" class="h-115 w-69 shrink-0 animate-pulse px-2">
    <div class="flex h-full w-65 flex-col justify-between gap-3 rounded-[20px] bg-card p-3.5">
      <div class="h-75 w-full rounded-[14px] bg-raised" />
      <div class="flex flex-col items-start gap-2">
        <div class="h-6 w-40 rounded bg-raised" />
        <div class="h-4 w-48 rounded bg-raised" />
        <div class="h-6 w-10 rounded-full bg-raised" />
      </div>
      <div class="flex flex-row items-center justify-between">
        <div class="h-4 w-20 rounded bg-raised" />
        <div class="h-10 w-30 rounded-full bg-raised" />
      </div>
    </div>
  </div>
</template>
