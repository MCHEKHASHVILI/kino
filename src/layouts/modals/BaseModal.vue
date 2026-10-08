<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import IconLoader from '@/components/shared/IconLoader.vue'
import { onClickOutside } from '@vueuse/core'
const modalRef = ref(null)
const props = defineProps({ isOpen: Boolean, title: String, subtitle: String, hideHeader: Boolean })
const emit = defineEmits(['close'])

watch(
  () => props.isOpen,
  (value) => {
    if (value) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  },
)
onClickOutside(modalRef, () => {
  emit('close')
})
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-shadow shadow-[0px_20px_50px_-10px] backdrop-blur-[10px]"
      >
        <div
          class="relative flex w-fit transform flex-col gap-6 rounded-[28px] border border-raised bg-page p-8 text-primary transition-all"
          ref="modalRef"
        >
          <div v-if="!hideHeader" class="w-full">
            <div class="flex flex-row justify-between">
              <div class="flex w-full flex-col gap-2">
                <div v-if="title" class="flex flex-row items-start justify-start">
                  <h2 class="text-h2 text-primary" v-text="title" />
                </div>
                <div v-if="subtitle" class="flex flex-row items-start justify-start">
                  <span class="text-body-s text-secondary" v-text="subtitle" />
                </div>
              </div>
              <div class="shrink">
                <slot name="exit">
                  <button
                    class="text-grayscale-400 cursor-pointer text-[13.2px]"
                    @click="$emit('close')"
                  >
                    <IconLoader name="Close" class="text-[24px] text-primary" />
                  </button>
                </slot>
              </div>
            </div>
          </div>
          <div class="w-full">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
