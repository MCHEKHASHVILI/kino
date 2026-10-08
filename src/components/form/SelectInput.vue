<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import IconLoader from '@/components/shared/IconLoader.vue'

type Value = string | number | null

const model = defineModel<Value>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    // Shown when nothing is picked, also offered as the first option to clear the value
    placeholder?: string
    options: { value: string | number; label: string }[]
    errors?: string[]
    // field: looks like the other inputs. plain: no background or border, sized to its text
    variant?: 'field' | 'plain'
    // Plain only, text before the chosen label, e.g. "Sort"
    prefix?: string
  }>(),
  { variant: 'field' },
)

const root = useTemplateRef<HTMLElement>('root')
const isOpen = ref(false)
// Keyboard highlighted row, index into items
const activeIndex = ref(-1)

// Placeholder row first, picking it clears the value like the native empty option did
const items = computed<{ value: Value; label: string }[]>(() => [
  ...(props.placeholder !== undefined ? [{ value: null, label: props.placeholder }] : []),
  ...props.options,
])

const selectedLabel = computed(
  () => props.options.find((option) => option.value === model.value)?.label ?? null,
)

function open() {
  activeIndex.value = Math.max(
    items.value.findIndex((item) => item.value === model.value),
    0,
  )
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function pick(value: Value) {
  model.value = value
  close()
}

// Arrows move the highlight (opening first), Enter picks it, Escape closes
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') return close()
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return
  event.preventDefault()
  if (!isOpen.value) return open()
  if (event.key === 'Enter') return pick(items.value[activeIndex.value]?.value ?? model.value)
  const step = event.key === 'ArrowDown' ? 1 : -1
  activeIndex.value = (activeIndex.value + step + items.value.length) % items.value.length
}

onClickOutside(root, close)
</script>

<template>
  <div ref="root" class="input-group relative" :class="variant === 'plain' ? 'w-fit' : 'w-full'">
    <label v-if="label" v-text="label" :class="{ 'text-helper-red!': errors && errors.length }" />
    <!-- Plain: prefix, chosen label and arrow in one transparent row -->
    <button
      v-if="variant === 'plain'"
      type="button"
      class="flex cursor-pointer flex-row items-center gap-2 rounded-[10px] pr-3.5 pl-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-helper-red/40"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="isOpen ? close() : open()"
      @keydown="onKeydown"
    >
      <span v-if="prefix" class="text-body-m text-secondary" v-text="prefix" />
      <span class="text-body-m text-primary" v-text="selectedLabel ?? placeholder ?? ''" />
      <IconLoader
        name="Arrow"
        :class="
          'text-[16px] text-primary transition-transform duration-200' +
          (isOpen ? ' rotate-180' : '')
        "
      />
    </button>
    <div v-else class="text-input">
      <!-- Looks like TextInput's input, opens a styled list instead of the browser's -->
      <button
        type="button"
        class="flex h-10 w-full cursor-pointer items-center rounded-xl border border-transparent bg-card pr-10 pl-4 text-left text-label-s text-secondary hover:border-disabled hover:bg-raised focus:border-disabled focus:outline-none"
        :class="[
          { 'border-helper-red! text-helper-red!': errors && errors.length },
          { 'border-disabled bg-card': isOpen },
        ]"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        @click="isOpen ? close() : open()"
        @keydown="onKeydown"
        v-text="selectedLabel ?? placeholder ?? ''"
      />
      <span class="suffix pointer-events-none">
        <IconLoader
          name="Arrow"
          :class="
            'text-[16px] text-primary transition-transform duration-200' +
            (isOpen ? ' rotate-180' : '')
          "
        />
      </span>
    </div>

    <ul
      v-if="isOpen"
      role="listbox"
      class="absolute top-full z-20 mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto rounded-2xl border border-raised bg-page p-2"
      :class="variant === 'plain' ? 'right-0 w-max min-w-full' : 'left-0 w-full'"
    >
      <li
        v-for="(item, index) in items"
        :key="item.value ?? 'none'"
        role="option"
        :aria-selected="item.value === model"
        class="flex h-10 cursor-pointer items-center rounded-xl px-4 text-label-s"
        :class="[
          item.value === model ? 'bg-helper-red text-primary' : 'text-secondary',
          { 'bg-raised text-primary': index === activeIndex && item.value !== model },
        ]"
        @mouseenter="activeIndex = index"
        @click="pick(item.value)"
        v-text="item.label"
      />
    </ul>

    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-label-s text-helper-red" v-text="error" />
    </div>
  </div>
</template>
