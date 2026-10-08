<script setup lang="ts">
withDefaults(defineProps<{ cards?: number }>(), { cards: 2 })
</script>
<template>
  <div class="flex animate-pulse flex-col gap-4">
    <!-- Same boxes as TicketCard: poster and details, dashed divider, order and refund side -->
    <div v-for="card in cards" :key="card" class="flex flex-row gap-4.5 rounded-[26px] bg-card">
      <div class="flex grow flex-row items-center justify-start gap-4.5 px-7.5 py-5">
        <div class="h-33.5 w-25 rounded-[10px] bg-raised" />
        <div class="flex flex-col justify-between gap-3">
          <div class="flex flex-row items-center gap-2.5">
            <div class="h-7 w-56 rounded bg-raised" />
            <div class="h-6 w-9 rounded-full bg-raised" />
            <div class="h-4 w-14 rounded bg-raised" />
          </div>
          <div class="flex flex-row items-center gap-10">
            <div v-for="detail in 3" :key="detail" class="flex flex-col gap-1">
              <div class="h-3 w-12 rounded bg-raised" />
              <div class="h-4 w-36 rounded bg-raised" />
            </div>
          </div>
          <div class="flex flex-row items-center gap-2">
            <div class="h-3 w-10 rounded bg-raised" />
            <div v-for="seat in 2" :key="seat" class="h-7 w-24 rounded-full bg-raised" />
          </div>
        </div>
      </div>
      <!-- divider -->
      <div
        class="relative w-px bg-[linear-gradient(to_bottom,currentColor_50%,transparent_50%)] bg-size-[1px_12px] bg-center bg-repeat-y text-raised"
      />
      <div class="flex w-75 flex-col justify-start gap-4 px-6 py-5">
        <div class="flex flex-col gap-0.5">
          <div class="h-3 w-12 rounded bg-raised" />
          <div class="h-4 w-28 rounded bg-raised" />
        </div>
        <div class="flex flex-row items-baseline justify-between">
          <div class="h-4 w-20 rounded bg-raised" />
          <div class="h-8 w-16 rounded bg-raised" />
        </div>
        <div class="h-11.5 w-full rounded-full bg-raised" />
        <div class="mx-auto h-3.5 w-44 rounded bg-raised" />
      </div>
    </div>
  </div>
</template>
