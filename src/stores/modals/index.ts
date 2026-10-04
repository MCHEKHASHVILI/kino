import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
export const useModalStore = defineStore('modals', () => {
  const activeModal = ref<string | null>(null)

  function openModal(modalName: string) {
    activeModal.value = modalName
  }

  function closeModal() {
    activeModal.value = null
  }

  // remove html body scroll while open
  watch(activeModal, (newValue) => {
    if (newValue) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  })

  return {
    activeModal,
    openModal,
    closeModal,
  }
})