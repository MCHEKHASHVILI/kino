<script setup lang="ts">
import BaseAvatar from './BaseAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import IconLoader from '@/components/shared/IconLoader.vue'
import { storeToRefs } from 'pinia'
import AppLink from '../shared/AppLink.vue'
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { firstName, isProfileComplete, avatar, fullName, logout } = authStore
</script>
<template>
  <div class="relative">
    <details class="group [&_summary::-webkit-details-marker]:hidden">
      <!-- Dropdown Trigger (Avatar, Name & Rotating Arrow) -->
      <summary class="flex cursor-pointer items-center gap-6">
        <span class="sr-only">Open user menu</span>

        <!-- Avatar -->
        <BaseAvatar
          :status="isProfileComplete ? 'complete' : 'incomplete'"
          :avatar="isProfileComplete ? avatar : null"
          alt="User profile avatar"
        />
        <!-- User Name -->
        <span class="text-label-m text-primary" v-text="firstName + 'test'" />

        <!-- Rotating Arrow Icon -->
        <IconLoader
          name="Arrow"
          class="text-[16px] text-primary transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      <!-- Dropdown Menu Box -->
      <div
        class="invisible absolute right-0 z-50 mt-2 origin-top-right rounded-2xl bg-page py-2.5 transition-all duration-100 group-open:visible group-open:opacity-100"
      >
        <!-- User Info Header -->
        <div class="flex w-full flex-col gap-4 px-5 pt-2.5">
          <div class="flex flex-row items-center gap-2.5">
            <BaseAvatar
              :status="isProfileComplete ? 'complete' : 'incomplete'"
              :avatar="isProfileComplete ? avatar : null"
              alt="User profile avatar"
            />
            <div class="flex flex-col justify-between gap-0.5">
              <span
                class="text-label-m text-nowrap text-primary capitalize"
                v-text="fullName + 'test best'"
              />
              <span class="text-body-s text-nowrap text-secondary" v-text="user?.email" />
            </div>
          </div>
          <div class="w-65.5">
            <div
              v-if="!isProfileComplete"
              class="flex flex-col gap-0.5 rounded-[10px] bg-tint-warning px-3 py-2.5"
            >
              <span class="text-label-m text-helper-orange first-letter:capitalize">
                profile incomplete
              </span>
              <span class="text-body-s text-secondary first-letter:capitalize">
                Please complete your profile to enable booking
              </span>
            </div>
            <div
              v-else
              class="text nowrap flex flex-row items-center justify-start gap-2.5 rounded-[10px] bg-tint-green px-3 py-2.5"
            >
              <span class="text-label-m text-helper-green capitalize">profile complete</span>
              <IconLoader name="Success" class="text-helper-green" />
            </div>
          </div>
        </div>

        <!-- Menu Links -->
        <ul class="flex flex-col gap-0.5 pt-1">
          <li class="block">
            <AppLink
              :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
              class="flex items-center justify-start gap-2 px-5 py-2.5 text-label-m text-primary capitalize hover:bg-card"
            >
              <IconLoader name="User" class="text-[16px] text-primary" />
              <span>my profile</span>
            </AppLink>
          </li>
          <li class="block">
            <AppLink
              :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
              class="flex items-center justify-start gap-2 px-5 py-2.5 text-label-m text-primary capitalize hover:bg-card"
            >
              <IconLoader name="Ticket" class="text-[16px] text-primary" />
              <span>my tickets</span>
            </AppLink>
          </li>

          <!-- Separator -->
          <div class="block border-t border-tint-white"></div>
          <!-- Sign Out -->
          <!-- <div>
            <a
              href="#"
              class="block rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign out
            </a>
          </div> -->
          <li class="block">
            <AppLink
              :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
              @click.prevent="logout"
              class="flex items-center justify-start gap-2 px-5 py-2.5 text-label-m text-helper-red hover:bg-card"
            >
              <IconLoader name="LogOut" class="text-[16px] text-helper-red" />
              <span class="first-letter:capitalize">log out</span>
            </AppLink>
          </li>
        </ul>
      </div>
    </details>
  </div>
</template>
