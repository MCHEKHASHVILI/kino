<script setup lang="ts">
import { onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import { useModalStore } from '@/stores/modals'
import { useTicketsStore } from '@/stores/tickets'

const emit = defineEmits<{ close: [] }>()

const { activeModal } = storeToRefs(useModalStore())
const ticketsStore = useTicketsStore()
const { refund, clearRefundCandidate } = ticketsStore
// Set by the ticket card's refund button right before opening
const { refundCandidate: order, isRefunding } = storeToRefs(ticketsStore)

// Closes either way, the card shows the refunded order or the API's refusal message
async function confirm() {
  if (!order.value) return
  await refund(order.value)
  emit('close')
}

onUnmounted(clearRefundCandidate)
</script>

<template>
  <BaseModal
    :isOpen="!!activeModal"
    :title="'Refund order'"
    :subtitle="order ? '#' + order.reference : ''"
    @close="emit('close')"
  >
    <div v-if="order" class="flex w-84.75 flex-col gap-6">
      <span
        class="text-body-m text-secondary"
        v-text="
          'Your seats for ' +
          order.session.movie.title +
          ' will be released and ₾' +
          order.totalPrice +
          ' refunded. This cannot be undone.'
        "
      />
      <div class="flex flex-row gap-3">
        <button
          type="button"
          class="flex-1 btn-transparent uppercase"
          :disabled="isRefunding(order)"
          @click="emit('close')"
          v-text="'cancel'"
        />
        <button
          type="button"
          class="flex-1 btn-primary uppercase"
          :disabled="isRefunding(order)"
          @click="confirm"
          v-text="'refund'"
        />
      </div>
    </div>
  </BaseModal>
</template>
