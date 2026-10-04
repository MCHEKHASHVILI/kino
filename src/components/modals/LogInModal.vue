<script setup lang="ts">
import BaseModal from '@/layouts/modals/BaseModal.vue'
import TextInput from '../form/TextInput.vue'
import AppLink from '@/components/shared/AppLink.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modals'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
const authStore = useAuthStore()
const { login, validationErrorsOf } = authStore
const { email, password, isLoading, isUnauthorized, inputIconStatus } = storeToRefs(authStore)
const modalStore = useModalStore()

const { activeModal } = storeToRefs(modalStore)

const isDisabled = computed(
  () => isLoading.value || !email.value?.length || !password.value?.length,
)

const validationErrors = computed(() => validationErrorsOf('login'))
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
        <TextInput
          type="text"
          label="email"
          v-model="email"
          :errors="validationErrors?.email"
          :icon="inputIconStatus('login', 'email')"
        />
        <TextInput
          type="password"
          label="password"
          v-model="password"
          :errors="validationErrors?.password"
          :icon="inputIconStatus('login', 'password')"
        />
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
          :to="{ name: 'action.modal', params: { name: 'RegistrationModal' } }"
          class="text-button text-helper-red lowercase first-letter:uppercase"
        >
          sign up
        </AppLink>
      </div>
    </div>
  </BaseModal>
</template>
