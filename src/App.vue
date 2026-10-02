<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
const route = useRoute()
const layout = computed(() => route.meta.layout || BaseLayout)
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
