<script setup lang="ts">
import ApplicationLogo from '@/components/shared/ApplicationLogo.vue'
</script>
<template>
  <!-- wrapper: centered, at most the 3xl container wide on large screens -->
  <footer class="wrapper bottom-0 flex flex-col gap-5 bg-page pt-6.75 pb-x-footer-figma">
    <div class="h-px w-full bg-raised"></div>
    <div class="flex flex-row items-center justify-between">
      <ApplicationLogo class="text-button" />
      <span class="text-body-s text-secondary">© 2026 Kino XII. All rights reserved.</span>
    </div>
  </footer>
</template>
