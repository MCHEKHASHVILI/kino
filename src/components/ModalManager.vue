<script setup lang="ts">
import { useModalStore } from '@/stores/modals'
import { computed, defineAsyncComponent } from 'vue'

const store = useModalStore()

// 1. Import all .vue files in the /modals folder
// { eager: true } loads them immediately; omit it for lazy loading
const modalFiles = import.meta.glob('@/components/modals/*.vue')

// 2. Map filenames to their dynamic component loaders
const modals = Object.fromEntries(
  Object.entries(modalFiles).map(([path, importFn]) => {
    const name = path.split('/').pop()?.replace('.vue', '') || ''
    return [name, defineAsyncComponent(importFn as any)]
  }),
)

// 3. Resolve the currently active component based on the store's string
const currentModalComponent = computed(() => {
  return store.activeModal ? modals[store.activeModal] : null
})
</script>

<template>
  <div v-if="store.activeModal" class="modal-overlay">
    <!-- Use Vue's <component :is="..."> to render the dynamic modal -->
    <component :is="currentModalComponent" @close="store.closeModal" />
  </div>
</template>
