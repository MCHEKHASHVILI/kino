<script setup lang="ts">
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
const route = useRoute()
</script>

<template>
  <div class="relative">
    <Header :class="route.meta.overlayHeader ? 'absolute inset-x-0 top-0 z-50' : 'relative z-50'" />
    <main>
      <slot />
    </main>
  </div>
  <Footer />
</template>
