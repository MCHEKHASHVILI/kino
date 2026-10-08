<script setup lang="ts">
withDefaults(defineProps<{ groups?: number; cards?: number }>(), { groups: 3, cards: 3 })
</script>
<template>
  <!-- Same boxes as the sessions list: movie row, its session cards, dividers between groups -->
  <div class="flex animate-pulse flex-col gap-8">
    <template v-for="group in groups" :key="group">
      <div class="flex flex-col justify-between gap-3.5">
        <div class="flex flex-row items-center justify-start gap-4">
          <div class="h-20 w-14 shrink-0 rounded-[8px] bg-raised" />
          <div class="flex flex-col justify-center gap-3">
            <div class="flex flex-row items-center gap-3">
              <div class="h-7 w-48 rounded bg-raised" />
              <div class="h-6 w-9 rounded-full bg-raised" />
            </div>
            <div class="h-4 w-16 rounded bg-raised" />
          </div>
        </div>
        <div class="flex flex-row flex-nowrap gap-3 overflow-hidden">
          <!-- Session card: time and format, then where and seats / price -->
          <div
            v-for="card in cards"
            :key="card"
            class="flex w-63 shrink-0 flex-col justify-between gap-3 rounded-2xl bg-card p-3.75"
          >
            <div class="flex flex-row items-center justify-between">
              <div class="h-6 w-14 rounded bg-raised" />
              <div class="h-8 w-20 rounded-full bg-raised" />
            </div>
            <div class="flex flex-row justify-between gap-2">
              <div class="flex flex-col items-start gap-2.5">
                <div class="h-3.5 w-24 rounded bg-raised" />
                <div class="h-3.5 w-32 rounded bg-raised" />
              </div>
              <div class="flex flex-col items-end gap-2.5">
                <div class="h-3.5 w-20 rounded bg-raised" />
                <div class="h-4 w-8 rounded bg-raised" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- divider, between groups only -->
      <div v-if="group < groups" class="h-px w-full bg-raised" />
    </template>
  </div>
</template>
