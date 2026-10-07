<script setup lang="ts">
withDefaults(defineProps<{ days?: number }>(), { days: 7 })
</script>
<template>
  <div class="flex animate-pulse flex-row gap-1.75">
    <!-- Matches badge-days box so dates don't shift when loaded -->
    <div
      v-for="day in days"
      :key="day"
      class="flex h-20 w-20 flex-col items-center justify-center gap-1.75 rounded-2xl bg-card"
    >
      <div class="h-3 w-7 rounded bg-raised" />
      <div class="h-4.5 w-6 rounded bg-raised" />
    </div>
  </div>
</template>
