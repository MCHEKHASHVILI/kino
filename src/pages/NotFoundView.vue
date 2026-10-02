<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main>
    <h1>Page not found</h1>
    <RouterLink :to="{ name: 'home' }">Go home</RouterLink>
  </main>
</template>
