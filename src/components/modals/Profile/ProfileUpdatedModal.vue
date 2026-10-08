<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseModal from '@/layouts/modals/BaseModal.vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { useModalStore } from '@/stores/modals'

const emit = defineEmits<{ close: [] }>()

const { activeModal } = storeToRefs(useModalStore())
</script>

<template>
  <BaseModal :isOpen="!!activeModal" @close="emit('close')" hideHeader>
    <div class="flex w-84.75 flex-col items-center gap-6">
      <div class="flex flex-col items-center gap-4">
        <div class="flex h-13 w-13 items-center justify-center rounded-full bg-helper-green">
          <IconLoader name="Confirm" class="text-[32px] text-primary" />
        </div>
        <h1
          class="text-center text-h2 text-primary first-letter:uppercase"
          v-text="'profile has been updated'"
        />
      </div>
      <button
        type="button"
        class="w-full btn-primary uppercase"
        @click="emit('close')"
        v-text="'ok'"
      />
    </div>
  </BaseModal>
</template>
