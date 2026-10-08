<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useModalStore } from '@/stores/modals'

// Opened by the booking store's expireHold, selection is already cleared and the flow is on step 1
const emit = defineEmits<{ close: [] }>()

const modalStore = useModalStore()
const { activeModal } = storeToRefs(modalStore)

// Booking modal opens on step 1 and refetches the map
function pickAgain() {
  modalStore.openModal('BookingModal')
}
</script>

<template>
  <BaseModal :isOpen="!!activeModal" @close="emit('close')" hideHeader>
    <div class="flex w-91.25 flex-col items-center gap-6" role="alertdialog">
      <div class="flex flex-col items-center gap-4">
        <div class="flex h-13 w-13 items-center justify-center rounded-full bg-helper-red">
          <IconLoader name="Timer" class="text-[32px] text-primary" />
        </div>
        <div class="flex flex-col items-center gap-2.5 text-center">
          <h1 class="text-h1 text-primary first-letter:uppercase" v-text="'hold expired'" />
          <span
            class="text-body-m text-secondary"
            v-text="
              'Your seats were held for too long and have been released. Pick your seats again to continue.'
            "
          />
        </div>
      </div>
      <div class="flex w-full flex-row gap-3">
        <button
          type="button"
          class="flex-1 btn-transparent uppercase"
          @click="emit('close')"
          v-text="'close'"
        />
        <button
          type="button"
          class="flex-1 btn-primary uppercase"
          @click="pickAgain"
          v-text="'pick seats again'"
        />
      </div>
    </div>
  </BaseModal>
</template>
