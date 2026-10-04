<script setup lang="ts">
import BaseModal from '@/layouts/modals/BaseModal.vue'
import TextInput from '../form/TextInput.vue'
import AppLink from '@/components/shared/AppLink.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modals'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
const authStore = useAuthStore()
const { login } = authStore
const { email, password } = storeToRefs(authStore)
const modalStore = useModalStore()

const { activeModal } = storeToRefs(modalStore)

const isDisabled = computed(() => !email.value?.length || !password.value?.length)
</script>
<template>
  <BaseModal
    :isOpen="!!activeModal"
    :title="'Log in'"
    :subtitle="'Welcome back to Kino XII'"
    @close="$emit('close')"
  >
    <div class="flex w-84.75 flex-col space-y-6">
      <form class="modal" @submit.prevent="login">
        <TextInput type="text" label="email" v-model="email" />
        <TextInput type="password" label="password" v-model="password" />
        <button
          class="w-full btn-primary first-letter:uppercase"
          type="submit"
          v-text="'log in'"
          :disabled="isDisabled"
        />
      </form>
      <div class="flex items-center justify-center space-x-2">
        <span class="text-body-m text-secondary lowercase first-letter:uppercase"
          >don't have an account?</span
        >
        <AppLink
          :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
          class="text-button text-helper-red lowercase first-letter:uppercase"
        >
          sign up
        </AppLink>
      </div>
    </div>
  </BaseModal>
</template>
