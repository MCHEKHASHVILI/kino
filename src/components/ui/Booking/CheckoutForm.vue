<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import TextInput from '@/components/form/TextInput.vue'
import { useBookingCheckoutStore } from '@/stores/booking/checkout'

const checkoutStore = useBookingCheckoutStore()
const { fill, resetCard, pay, validationErrorsOf } = checkoutStore
const { fullName, email, mobileNumber, cardNumber, expiry, cvv, inputIconStatus } =
  storeToRefs(checkoutStore)

const validationErrors = computed(() => validationErrorsOf('order'))

fill()
onUnmounted(resetCard)
</script>

<template>
  <!-- Pay button lives in the modal's summary column and submits this form through form="checkout-form" -->
  <form id="checkout-form" class="flex w-full flex-col justify-around gap-6" @submit.prevent="pay">
    <TextInput
      type="text"
      label="full name"
      autocomplete="name"
      v-model="fullName"
      :errors="validationErrors?.fullName"
      :icon="inputIconStatus('order', 'fullName')"
    />
    <div class="flex flex-row gap-4">
      <TextInput
        type="email"
        label="email"
        autocomplete="email"
        v-model="email"
        :errors="validationErrors?.email"
        :icon="inputIconStatus('order', 'email')"
        :disabled="true"
      />
      <TextInput
        type="tel"
        label="mobile number"
        placeholder="5XX XXX XXX"
        autocomplete="tel-national"
        v-model="mobileNumber"
        :errors="validationErrors?.mobileNumber"
        :icon="inputIconStatus('order', 'mobileNumber')"
      />
    </div>
    <!-- divider -->
    <div class="relative flex h-px w-full items-center bg-card"></div>
    <TextInput
      type="text"
      label="card number"
      placeholder="4242 4242 4242 4242"
      inputmode="numeric"
      autocomplete="cc-number"
      v-model="cardNumber"
      :errors="validationErrors?.cardNumber"
      :icon="inputIconStatus('order', 'cardNumber')"
    />
    <div class="flex flex-row gap-4">
      <TextInput
        type="text"
        label="expiry"
        placeholder="MM/YY"
        inputmode="numeric"
        autocomplete="cc-exp"
        v-model="expiry"
        :errors="validationErrors?.expiry"
        :icon="inputIconStatus('order', 'expiry')"
      />
      <TextInput
        type="text"
        label="cvv"
        placeholder="123"
        inputmode="numeric"
        autocomplete="cc-csc"
        v-model="cvv"
        :errors="validationErrors?.cvv"
        :icon="inputIconStatus('order', 'cvv')"
      />
    </div>
  </form>
</template>
