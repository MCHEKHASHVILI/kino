<script setup lang="ts">
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
defineProps<{ query: string }>()
</script>
<template>
  <div class="flex flex-col items-center gap-1.5">
    <IconLoader :name="'Search'" class="text-5xl text-primary" />
    <span class="mt-3.5 text-label-m text-primary">No results for “{{ query }}”</span>
    <span class="text-body-m text-primary"
      >Check the spelling or try another film or live event.</span
    >
    <AppLink :to="{ name: 'sessions' }" class="mt-4 btn-transparent">Browse all sessions</AppLink>
  </div>
</template>
