<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import TextInput from '@/components/form/TextInput.vue'
import SelectInput from '@/components/form/SelectInput.vue'
import DateInput from '@/components/form/DateInput.vue'
import { useProfileStore } from '@/stores/profile'

// Fields are filled by the profile page once per visit, so edits survive switching tabs
const profileStore = useProfileStore()
const { updateProfile, validationErrorsOf } = profileStore
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

const venueOptions = computed(() =>
  venues.value.map((venue) => ({ value: venue.id, label: venue.name })),
)
const validationErrors = computed(() => validationErrorsOf('profile'))

// Date of birth can't be in the future, YYYY-MM-DD in local time
const now = new Date()
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((part) => String(part).padStart(2, '0'))
  .join('-')
</script>

<template>
  <form class="flex w-220 flex-col gap-9" @submit.prevent="updateProfile">
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
    <DateInput
      label="date of birth"
      placeholder="Select date"
      v-model="dateOfBirth"
      :max="today"
      :errors="validationErrors?.dateOfBirth"
    />
    <SelectInput
      label="preferred venue"
      placeholder="No preference"
      v-model="preferredVenueId"
      :options="venueOptions"
      :errors="validationErrors?.preferredVenueId"
    />

    <!-- Success opens ProfileUpdatedModal -->
    <div class="flex flex-row items-center gap-4">
      <button
        type="submit"
        class="btn-primary uppercase"
        :disabled="isLoading"
        v-text="'save changes'"
      />
    </div>
  </form>
</template>
