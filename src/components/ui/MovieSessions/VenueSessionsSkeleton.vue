<script setup lang="ts">
withDefaults(defineProps<{ venues?: number; halls?: number; tickets?: number }>(), {
  venues: 2,
  halls: 2,
  tickets: 2,
})
</script>
<template>
  <div class="flex animate-pulse flex-col gap-6.75">
    <div v-for="venue in venues" :key="venue" class="flex flex-col gap-4">
      <div class="h-3.5 w-40 rounded bg-raised" />
      <div class="flex flex-row items-center justify-start gap-2.5">
        <div
          v-for="hall in halls"
          :key="hall"
          class="flex flex-col justify-start gap-2.25 rounded-[18px] bg-card p-3.75"
        >
          <div class="h-4 w-16 rounded bg-raised" />
          <div class="flex flex-row justify-between gap-2.25">
            <!-- Ticket: time side (w-31) + divider + price side (w-20.75) -->
            <div v-for="ticket in tickets" :key="ticket" class="flex h-19.5 w-52 rounded-2xl bg-page">
              <div class="flex w-31 flex-col items-center justify-center gap-2">
                <div class="h-5 w-14 rounded bg-raised" />
                <div class="h-3 w-16 rounded bg-raised" />
              </div>
              <div class="flex w-20.75 flex-col items-center justify-center gap-2">
                <div class="h-4.5 w-12 rounded bg-raised" />
                <div class="h-3 w-10 rounded bg-raised" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
