<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TextInput from '@/components/form/TextInput.vue'
import SelectInput from '@/components/form/SelectInput.vue'
import TicketCard from '@/components/ui/Tickets/TicketCard.vue'
import { PROFILE_TABS, useProfileStore, type ProfileTab } from '@/stores/profile'
import { TICKET_GROUPS, useTicketsStore, type TicketGroup } from '@/stores/tickets'

const route = useRoute()
const router = useRouter()

const profileStore = useProfileStore()
const { fill, fetchVenues, updateProfile, validationErrorsOf } = profileStore
const {
  fullName,
  email,
  mobileNumber,
  dateOfBirth,
  preferredVenueId,
  venues,
  isLoading,
  inputIconStatus,
} = storeToRefs(profileStore)

const ticketsStore = useTicketsStore()
const { fetchTickets } = ticketsStore
const { ordersByGroup, isLoading: isTicketsLoading } = storeToRefs(ticketsStore)

const tabLabels: Record<ProfileTab, string> = {
  personal: 'personal information',
  tickets: 'my tickets',
}

// Route guard guarantees a valid ?tab=, switching tabs only rewrites the query
const tab = computed<ProfileTab>({
  get: () => route.query.tab as ProfileTab,
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

// Upcoming unless ?group= names another one, kept in the query like the main tab
const ticketGroup = computed<TicketGroup>({
  get: () =>
    TICKET_GROUPS.includes(route.query.group as TicketGroup)
      ? (route.query.group as TicketGroup)
      : 'upcoming',
  set: (value) => router.replace({ query: { ...route.query, group: value } }),
})

const venueOptions = computed(() =>
  venues.value.map((venue) => ({ value: venue.id, label: venue.name })),
)
const validationErrors = computed(() => validationErrorsOf('profile'))
const isSaved = ref(false)

async function submit() {
  isSaved.value = await updateProfile()
}

fill()
fetchVenues()

// Loaded with the page for the tab's count badge, refreshed whenever the tab is opened
fetchTickets()
watch(tab, (value) => value === 'tickets' && fetchTickets())
</script>

<template>
  <section class="flex flex-col gap-8 px-12.75 py-10">
    <h1 class="text-h2 text-primary capitalize" v-text="'my profile'" />

    <div class="flex w-full flex-row gap-8 border-b border-b-card">
      <label v-for="value in PROFILE_TABS" :key="value" class="profile-tabs items-center">
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

    <form v-if="tab === 'personal'" class="flex w-120 flex-col gap-6" @submit.prevent="submit">
      <TextInput
        type="text"
        label="full name"
        v-model="fullName"
        :errors="validationErrors?.fullName"
        :icon="inputIconStatus('profile', 'fullName')"
      />
      <!-- Set at registration, the API ignores changes -->
      <TextInput type="email" label="email" :model-value="email" disabled />
      <TextInput
        type="tel"
        label="mobile number"
        placeholder="5XX XXX XXX"
        v-model="mobileNumber"
        :errors="validationErrors?.mobileNumber"
        :icon="inputIconStatus('profile', 'mobileNumber')"
      />
      <TextInput
        type="date"
        label="date of birth"
        v-model="dateOfBirth"
        :errors="validationErrors?.dateOfBirth"
        :icon="inputIconStatus('profile', 'dateOfBirth')"
      />
      <SelectInput
        label="preferred venue"
        placeholder="No preference"
        v-model="preferredVenueId"
        :options="venueOptions"
        :errors="validationErrors?.preferredVenueId"
      />

      <div class="flex flex-row items-center gap-4">
        <button
          type="submit"
          class="btn-primary uppercase"
          :disabled="isLoading"
          v-text="'save changes'"
        />
        <span v-if="isSaved" class="text-body-s text-helper-green" v-text="'Profile saved'" />
      </div>
    </form>

    <div v-else class="flex flex-col gap-6">
      <div class="flex w-fit flex-row gap-2 rounded-full bg-card">
        <label v-for="value in TICKET_GROUPS" :key="value" class="badge-progress">
          <input
            type="radio"
            class="sr-only"
            :value="value"
            v-model="ticketGroup"
            name="ticketGroup"
          />
          <span class="uppercase" v-text="value" />
        </label>
      </div>
      <div class="flex flex-col gap-4">
        <span
          v-if="!ordersByGroup[ticketGroup].length && !isTicketsLoading"
          class="text-body-m text-secondary"
          v-text="ticketGroup === 'upcoming' ? 'No upcoming tickets.' : 'No past tickets.'"
        />
        <TicketCard v-for="order in ordersByGroup[ticketGroup]" :key="order.id" :order="order" />
      </div>
    </div>
  </section>
</template>
