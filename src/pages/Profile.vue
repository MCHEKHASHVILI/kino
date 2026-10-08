<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProfileForm from '@/components/ui/Profile/ProfileForm.vue'
import MyTickets from '@/components/ui/Tickets/MyTickets.vue'
import { PROFILE_TABS, useProfileStore, type ProfileTab } from '@/stores/profile'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()

const { fill, fetchVenues } = useProfileStore()

const ticketsStore = useTicketsStore()
const { fetchTickets } = ticketsStore
const { ordersByGroup } = storeToRefs(ticketsStore)

const tabLabels: Record<ProfileTab, string> = {
  personal: 'personal information',
  tickets: 'my tickets',
}

// Route guard guarantees a valid ?tab=, switching tabs only rewrites the query
const tab = computed<ProfileTab>({
  get: () => route.query.tab as ProfileTab,
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

const { user } = storeToRefs(useAuthStore())

// Here rather than in the form, which remounts on every tab switch and would drop edits.
// Refilled when the user changes, e.g. GET /me answering after the page opened
watch(user, (value) => fill(value), { immediate: true })
fetchVenues()

// Once per visit, also for the tab's count badge. Refunds update the list from their response
fetchTickets()
</script>

<template>
  <section class="flex flex-col gap-8 py-10">
    <h1 class="text-h2 text-primary capitalize" v-text="'my profile'" />

    <div class="flex w-full flex-row gap-8 border-b border-b-card">
      <label v-for="value in PROFILE_TABS" :key="value" class="profile-tab items-center">
        <input type="radio" class="sr-only" :value="value" v-model="tab" name="profileTab" />
        <span class="uppercase" v-text="tabLabels[value]" />
        <!-- Count label only (active tickets), the whole tab is the click target -->
        <span
          v-if="value === 'tickets' && ordersByGroup.upcoming.length"
          class="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-helper-red px-1 text-label-s text-primary"
          v-text="ordersByGroup.upcoming.length"
        />
      </label>
    </div>

    <ProfileForm v-if="tab === 'personal'" />

    <MyTickets v-else />
  </section>
</template>
