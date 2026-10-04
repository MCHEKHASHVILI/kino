<script setup lang="ts">
import BaseModal from '@/layouts/modals/BaseModal.vue'
import TextInput from '../form/TextInput.vue'
import FileInput from '../form/FileInput.vue'
import AppLink from '@/components/shared/AppLink.vue'
import { useRegistrationStore } from '@/stores/registration'
import { useModalStore } from '@/stores/modals'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
const registrationStore = useRegistrationStore()
const { register, validationErrorsOf } = registrationStore
const { email, password, passwordConfirmation, userName, avatar, isLoading, inputIconStatus } =
  storeToRefs(registrationStore)
const modalStore = useModalStore()

const { activeModal } = storeToRefs(modalStore)

const isDisabled = computed(
  () =>
    isLoading.value ||
    !userName.value?.length ||
    !email.value?.length ||
    !password.value?.length ||
    !passwordConfirmation.value?.length,
)

const validationErrors = computed(() => validationErrorsOf('register'))
</script>
<template>
  <BaseModal
    :isOpen="!!activeModal"
    :title="'Sign up'"
    :subtitle="'Welcome to Kino XII'"
    @close="$emit('close')"
  >
    <div class="flex w-102.75 flex-col space-y-6">
      <form class="modal" @submit.prevent="register">
        <FileInput
          v-model="avatar"
          title="Upload avatar"
          description="JPG, PNG or WEBP"
          optional
          :accept="['image/jpeg', 'image/png', 'image/webp']"
          :errors="validationErrors?.avatar"
        />
        <TextInput
          type="text"
          label="username"
          v-model="userName"
          :errors="validationErrors?.username"
          :icon="inputIconStatus('register', 'username')"
        />
        <TextInput
          type="text"
          label="email"
          v-model="email"
          :errors="validationErrors?.email"
          :icon="inputIconStatus('register', 'email')"
        />
        <div class="flex flex-row justify-between gap-3">
          <TextInput
            type="password"
            label="password"
            v-model="password"
            :errors="validationErrors?.password"
            :icon="inputIconStatus('register', 'password')"
          />
          <TextInput
            type="password"
            label="confirm password"
            v-model="passwordConfirmation"
            :errors="validationErrors?.password_confirmation"
            :icon="inputIconStatus('register', 'password_confirmation')"
          />
        </div>

        <button
          class="w-full btn-primary first-letter:uppercase"
          type="submit"
          v-text="'sign up'"
          :disabled="isDisabled"
        />
      </form>
      <div class="flex items-center justify-center space-x-2">
        <span class="text-body-m text-secondary lowercase first-letter:uppercase"
          >already have an account?</span
        >
        <AppLink
          :to="{ name: 'action.modal', params: { name: 'LogInModal' } }"
          class="text-button text-helper-red lowercase first-letter:uppercase"
        >
          log in
        </AppLink>
      </div>
    </div>
  </BaseModal>
</template>
