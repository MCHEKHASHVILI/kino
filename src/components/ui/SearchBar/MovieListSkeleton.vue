<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 })
</script>
<template>
  <div class="flex animate-pulse flex-col items-center gap-1.5 p-2">
    <div class="flex w-full flex-row items-center justify-between px-2.5 pt-2 pb-1.5">
      <div class="h-3 w-28 rounded bg-raised" />
      <div class="h-3 w-14 rounded bg-raised" />
    </div>
    <ul class="w-full">
      <li v-for="row in rows" :key="row" class="py-2 pr-5 pl-2.5">
        <div class="flex w-full flex-row items-center gap-3.5">
          <div class="h-14 w-10 shrink-0 rounded-md bg-raised" />
          <div class="flex grow flex-col items-start justify-center gap-2">
            <div class="h-4 w-1/2 rounded bg-raised" />
            <div class="h-3 w-1/3 rounded bg-raised" />
          </div>
          <div class="h-4 w-16 rounded bg-raised" />
        </div>
      </li>
    </ul>
  </div>
</template>
