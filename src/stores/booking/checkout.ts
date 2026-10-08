import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderForm } from '@types'
import { isApiError } from '@/api/ApiError'
import { useApiStore } from '../api'
import { useAuthStore } from '../auth'
import { useModalStore } from '../modals'
import { useBookingStore } from '.'

// Step 2 of the booking modal: contact and card details, paying turns the live hold into an order
export const useBookingCheckoutStore = defineStore('booking.checkout', () => {
  const api = useApiStore()
  const { validationErrorsOf } = api
  const { inputIconStatus } = storeToRefs(api)
  const authStore = useAuthStore()
  const bookingStore = useBookingStore()

  // State
  const fullName = ref<string | null>(null)
  const email = ref<string | null>(null)
  const mobileNumber = ref<string | null>(null)
  const cardNumber = ref<string | null>(null)
  const expiry = ref<string | null>(null)
  const cvv = ref<string | null>(null)
  // Paid order, the confirmation view renders from it
  const order = ref<Order | null>(null)

  // Getters
  const isPaying = computed(() => api.isLoading('order'))

  // Pay button stays disabled until every field has a value and the seats are held
  const isFilled = computed(
    () =>
      !!bookingStore.heldSeats &&
      [fullName, email, mobileNumber, cardNumber, expiry, cvv].every(
        (field) => !!field.value?.trim(),
      ),
  )

  // Actions
  // API asks to prefill contact details from the profile, fields the user already typed are kept
  function fill() {
    const user = authStore.user
    fullName.value ||= user?.fullName ?? null
    email.value ||= user?.email ?? null
    mobileNumber.value ||= user?.mobileNumber ?? null
  }

  // Card details never outlive the modal
  function resetCard() {
    cardNumber.value = null
    expiry.value = null
    cvv.value = null
  }

  // Confirmation modal shows the order once, dropped when it closes
  function clearOrder() {
    order.value = null
  }

  /**
   * POST /orders, the only call that sells the seats.
   * 422 with field errors lands under the 'order' key (global handler), the inputs read it from there.
   * 422 without them means the hold expired, 409 means a seat was sold meanwhile: both go back to step 1
   */
  async function pay(): Promise<boolean> {
    const holdId = bookingStore.heldSeats?.holdId
    if (!holdId || !isFilled.value || isPaying.value) return false

    const body: OrderForm = {
      holdId,
      fullName: fullName.value!.trim(),
      email: email.value!.trim(),
      mobileNumber: mobileNumber.value!.trim(),
      cardNumber: cardNumber.value!.trim(),
      expiry: expiry.value!.trim(),
      cvv: cvv.value!.trim(),
    }

    try {
      const response = await api.post<{ data: Order }>('order', 'orders', body)
      order.value = response.data
      bookingStore.forgetHold()
      resetCard()
      // Replaces the booking modal, its close runs closeBooking with nothing left to release
      useModalStore().openModal('BookingConfirmationModal')
      return true
    } catch (error) {
      if (!isApiError(error)) return false
      if (error.status === 422 && !error.hasValidationErrors) await bookingStore.returnToSeats()
      if (error.status === 409) {
        const data = error.original.response?.data as { contested?: string[] } | undefined
        await bookingStore.returnToSeats(data?.contested ?? [])
      }
      return false
    }
  }

  return {
    fullName,
    email,
    mobileNumber,
    cardNumber,
    expiry,
    cvv,
    order,
    isPaying,
    isFilled,
    fill,
    resetCard,
    clearOrder,
    pay,
    validationErrorsOf,
    inputIconStatus,
  }
})
