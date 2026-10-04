<script setup lang="ts">
import { ref, computed } from 'vue'
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
const currentIcon = computed<string | undefined>(() => props.icon)
</script>

<template>
  <div class="input-group relative w-full">
    <label v-if="label" v-text="label" :class="{ 'text-helper-red!': errors && errors.length }" />
    <div class="text-input">
      <span
        v-if="prefix"
        class="prefix"
        :class="{ 'text-helper-red': errors && errors.length }"
        v-text="prefix"
      />
      <input
        v-model="model"
        :type="currentType"
        :placeholder="placeholder"
        :class="[
          'peer',
          { 'pr-12 pl-13!': prefix },
          { 'border-helper-red! text-helper-red!': errors && errors.length },
        ]"
        v-bind="$attrs"
      />
      <span
        v-if="icon || (errors && errors.length)"
        class="suffix"
        :class="[
          { 'text-helper-red!': errors && errors.length },
          { 'text-helper-green': !errors || !errors.length },
        ]"
      >
        <IconLoader :name="currentIcon || ''" class="text-[16px]" />
      </span>
    </div>
    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-label-s text-helper-red" v-text="error" />
    </div>
  </div>
</template>
