<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import BaseAvatar from './BaseAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import IconLoader from '@/components/shared/IconLoader.vue'
import AppLink from '../shared/AppLink.vue'

const authStore = useAuthStore()
const { user, firstName, isProfileComplete, avatar, fullName } = storeToRefs(authStore)
const { logout } = authStore

const route = useRoute()
const root = useTemplateRef('root')
const isOpen = ref(false)
// skip the fade-out when closing because of navigation, so it doesn't lag behind the page change
const animate = ref(true)

function toggle() {
  animate.value = true
  isOpen.value = !isOpen.value
}

function close() {
  animate.value = true
  isOpen.value = false
}

function closeInstantly() {
  animate.value = false
  isOpen.value = false
}

function handleLogout() {
  closeInstantly()
  logout()
}

onClickOutside(root, close)
onKeyStroke('Escape', close)
// menu items close on click; this covers browser back/forward
watch(() => route.fullPath, closeInstantly)
</script>
<template>
  <div ref="root" class="relative">
    <!-- Dropdown Trigger (Avatar, Name & Rotating Arrow) -->
    <button
      type="button"
      class="flex cursor-pointer items-center gap-6"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      aria-controls="user-menu"
      @click="toggle"
    >
      <span class="sr-only">Open user menu</span>

      <!-- Avatar -->
      <BaseAvatar
        :status="isProfileComplete ? 'complete' : 'incomplete'"
        :avatar="isProfileComplete ? avatar : null"
        alt="User profile avatar"
      />
      <!-- User Name -->
      <span class="text-label-m text-primary" v-text="firstName" />

      <!-- Rotating Arrow Icon -->
      <IconLoader
        name="Arrow"
        :class="
          [
            'text-[16px] text-primary transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          ].join(' ')
        "
      />
    </button>

    <!-- Dropdown Menu Box -->
    <Transition
      :css="animate"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-100"
      leave-active-class="transition-opacity duration-100"
    >
      <div
        v-show="isOpen"
        id="user-menu"
        class="absolute right-0 z-50 mt-2 origin-top-right rounded-2xl bg-page py-2.5"
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
              <span class="text-label-m text-nowrap text-primary capitalize" v-text="fullName" />
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
              class="flex flex-row items-center justify-start gap-2.5 rounded-[10px] bg-tint-green px-3 py-2.5 text-nowrap"
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
              @click="closeInstantly"
              class="flex items-center justify-start gap-2 px-5 py-2.5 text-label-m text-primary capitalize hover:bg-card"
            >
              <IconLoader name="User" class="text-[16px] text-primary" />
              <span>my profile</span>
            </AppLink>
          </li>
          <li class="block">
            <AppLink
              :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
              @click="closeInstantly"
              class="flex items-center justify-start gap-2 px-5 py-2.5 text-label-m text-primary capitalize hover:bg-card"
            >
              <IconLoader name="Ticket" class="text-[16px] text-primary" />
              <span>my tickets</span>
            </AppLink>
          </li>

          <!-- Separator -->
          <li role="separator" class="block border-t border-tint-white"></li>

          <!-- Sign Out -->
          <li class="block">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-start gap-2 px-5 py-2.5 text-label-m text-helper-red hover:bg-card"
              @click="handleLogout"
            >
              <IconLoader name="LogOut" class="text-[16px] text-helper-red" />
              <span class="first-letter:capitalize">log out</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
