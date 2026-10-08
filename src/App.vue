<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import ModalManager from '@/components/ModalManager.vue'
import { useFilterOptionsStore } from '@/stores/filterOptions'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
const route = useRoute()

// Shared by filters and booking, loaded once per page load
useFilterOptionsStore().fetchFilterOptions()
// Seats held before a reload come back with the booking modal open on checkout
useBookingStore().restoreHold()
// Signed in from a previous visit: personal information is refreshed first, a stale token
// is dropped there, then tickets are ready like after a fresh login
useAuthStore()
  .restoreSession()
  .then((isSignedIn) => {
    if (isSignedIn) useTicketsStore().fetchTickets()
  })
const layout = computed(() => route.meta.layout || BaseLayout)
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <ModalManager />
</template>
