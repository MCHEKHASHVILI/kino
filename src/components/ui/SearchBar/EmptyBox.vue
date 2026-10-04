<script setup lang="ts">
import AppLink from '@/components/shared/AppLink.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
</script>
<template>
  <div class="flex flex-col items-center gap-1.5">
    <IconLoader :name="'Popcorn'" class="text-5xl text-primary" />
    <span class="mt-3.5 text-label-m text-primary">What do you want to watch?</span>
    <span class="text-body-m text-primary">Search by title, director or cast</span>
    <AppLink :to="{ name: 'sessions' }" class="mt-4 btn-transparent">Browse all sessions</AppLink>
  </div>
</template>
