<script setup lang="ts">
import ApplicationLogo from '@/components/shared/ApplicationLogo.vue'
import AppLink from '@/components/shared/AppLink.vue'
import SearchBar from '@/components/ui/SearchBar'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import UserDropDown from './ui/UserDropDown.vue'
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>
<template>
  <header
    class="flex items-center justify-between bg-linear-to-b from-[#000000] via-[#00000082] to-[#00000000] px-15 pt-7.5 pb-10"
  >
    <div class="flex items-center justify-start gap-9">
      <ApplicationLogo class="text-h2" />
      <nav class="flex gap-5">
        <AppLink :to="{ name: 'sessions' }" class="text-overline text-primary">sessions</AppLink>
      </nav>
    </div>
    <div class="flex items-center justify-start gap-8">
      <SearchBar />
      <div v-if="!isAuthenticated" class="flex gap-3">
        <AppLink :to="{ name: 'action.modal', params: { name: 'RegisterModal' } }">
          <button class="btn-primary first-letter:uppercase">sign up</button>
        </AppLink>
        <AppLink :to="{ name: 'action.modal', params: { name: 'LogInModal' } }">
          <button class="btn-secondary first-letter:uppercase">log in</button>
        </AppLink>
      </div>
      <UserDropDown v-else />
    </div>
  </header>
</template>
