<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import ModalManager from '@/components/ModalManager.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
const route = useRoute()

// Shared by filters and booking, loaded once per page load
useFilterOptionsStore().fetchFilterOptions()
const layout = computed(() => route.meta.layout || BaseLayout)
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <ModalManager />
</template>
