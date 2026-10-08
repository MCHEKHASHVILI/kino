<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TicketCard from '@/components/ui/Tickets/TicketCard.vue'
import { TICKET_GROUPS, useTicketsStore, type TicketGroup } from '@/stores/tickets'

const route = useRoute()
const router = useRouter()

// Tickets are fetched by the profile page, which also needs them for the tab's count badge
const { ordersByGroup, isLoading } = storeToRefs(useTicketsStore())

// Upcoming unless ?group= names another one, kept in the query like the profile tab
const ticketGroup = computed<TicketGroup>({
  get: () =>
    TICKET_GROUPS.includes(route.query.group as TicketGroup)
      ? (route.query.group as TicketGroup)
      : 'upcoming',
  set: (value) => router.replace({ query: { ...route.query, group: value } }),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex w-fit flex-row gap-2 rounded-xl bg-card p-1.25">
      <label v-for="value in TICKET_GROUPS" :key="value" class="tickets-tab">
        <input
          type="radio"
          class="sr-only"
          :value="value"
          v-model="ticketGroup"
          name="ticketGroup"
        />
        <span class="uppercase" v-text="value + ' ' + ordersByGroup[value].length" />
      </label>
    </div>
    <div class="flex flex-col gap-4">
      <span
        v-if="!ordersByGroup[ticketGroup].length && !isLoading"
        class="text-body-m text-secondary"
        v-text="ticketGroup === 'upcoming' ? 'No upcoming tickets.' : 'No past tickets.'"
      />
      <TicketCard v-for="order in ordersByGroup[ticketGroup]" :key="order.id" :order="order" />
    </div>
  </div>
</template>
