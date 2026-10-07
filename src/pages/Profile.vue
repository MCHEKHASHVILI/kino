<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TextInput from '@/components/form/TextInput.vue'
import SelectInput from '@/components/form/SelectInput.vue'
import { PROFILE_TABS, useProfileStore, type ProfileTab } from '@/stores/profile'

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

const tabLabels: Record<ProfileTab, string> = {
  personal: 'personal information',
  tickets: 'my tickets',
}

// Route guard guarantees a valid ?tab=, switching tabs only rewrites the query
const tab = computed<ProfileTab>({
  get: () => route.query.tab as ProfileTab,
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
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
</script>

<template>
  <section class="flex flex-col gap-8 px-12.75 py-10">
    <h1 class="text-h2 text-primary capitalize" v-text="'my profile'" />

    <div class="flex w-120 flex-row gap-2 rounded-full bg-card">
      <label v-for="value in PROFILE_TABS" :key="value" class="badge-progress">
        <input type="radio" class="sr-only" :value="value" v-model="tab" name="profileTab" />
        <span class="uppercase" v-text="tabLabels[value]" />
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

    <div v-else class="flex flex-col gap-2">
      <span class="text-body-m text-secondary" v-text="'No tickets yet.'" />
    </div>
  </section>
</template>
