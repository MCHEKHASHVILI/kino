<script setup lang="ts">
import StatusDot from '@/assets/svg/Dot.svg?component'
import IconLoader from '@/components/shared/IconLoader.vue'
const props = withDefaults(
  defineProps<{
    status: 'complete' | 'incomplete'
    avatar?: string | null
  }>(),
  {
    status: 'incomplete',
  },
)

const statusColor = {
  complete: 'text-helper-green',
  incomplete: 'text-helper-orange',
}
</script>

<template>
  <div class="relative flex aspect-square h-10 items-center justify-center rounded-lg bg-card">
    <!-- No avatar uploaded -->
    <IconLoader v-if="!avatar" name="User" class="text-[16px] text-primary" />
    <div v-else class="circle-container">
      <img :src="avatar" alt="preview" />
    </div>
    <StatusDot
      class="absolute -right-px -bottom-px stroke-page text-[8px]"
      :class="statusColor[status]"
    />
  </div>
</template>
<style lang="css" scoped>
.circle-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.circle-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
