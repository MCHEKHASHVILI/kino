<script setup lang="ts">
import { ref } from 'vue'
import IconLoader from '@/components/shared/IconLoader.vue'
const model = defineModel<string | number | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    prefix?: string
    type?: 'text' | 'password' | 'email' | 'number'
    placeholder?: string
    icon?: string
    errors?: string[]
  }>(),
  {
    type: 'text',
  },
)

const currentType = ref(props.type)
const currentIcon = ref<string | undefined>(props.icon)

const toggleVisibility = () => {
  if (props.icon && !props.icon.includes('eye')) return
  currentType.value = currentType.value === 'password' ? 'text' : 'password'
  currentIcon.value = currentIcon.value === 'eye_closed' ? 'eye_open' : 'eye_closed'
}
</script>

<template>
  <div class="input-group relative w-full">
    <label v-if="label" v-text="label" />
    <div class="text-input">
      <span
        v-if="prefix"
        class="prefix"
        :class="{ 'text-helper-error': errors && errors.length }"
        v-text="prefix"
      />
      <input
        v-model="model"
        :type="currentType"
        :placeholder="placeholder"
        :class="[
          'peer',
          { 'pr-12 pl-13!': prefix },
          { 'text-helper-error! border-helper-error!': errors && errors.length },
        ]"
        v-bind="$attrs"
      />
      <span
        v-if="icon"
        class="suffix"
        :class="[
          { 'text-helper-error!': errors && errors.length },
          {
            'cursor-pointer!': type === 'password' || icon.includes('eye'),
          },
        ]"
        @click="toggleVisibility"
      >
        <IconLoader :name="currentIcon || ''" />
      </span>
    </div>
    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-helper-error text-xs font-normal" v-text="error" />
    </div>
  </div>
</template>
