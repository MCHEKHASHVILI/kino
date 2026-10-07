<script setup lang="ts">
const model = defineModel<string | number | null>({ default: null })

defineProps<{
  label?: string
  placeholder?: string
  options: { value: string | number; label: string }[]
  errors?: string[]
}>()
</script>

<template>
  <div class="input-group relative w-full">
    <label v-if="label" v-text="label" :class="{ 'text-helper-red!': errors && errors.length }" />
    <div class="text-input">
      <!-- Same look as TextInput's input, native select keeps keyboard and mobile pickers -->
      <select
        v-model="model"
        class="h-10 w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-card px-4 text-label-s text-secondary outline-none hover:border-disabled hover:bg-raised focus:border-disabled focus:bg-card"
        :class="{ 'border-helper-red! text-helper-red!': errors && errors.length }"
        v-bind="$attrs"
      >
        <option :value="null" v-text="placeholder ?? ''" />
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          v-text="option.label"
        />
      </select>
    </div>
    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-label-s text-helper-red" v-text="error" />
    </div>
  </div>
</template>
