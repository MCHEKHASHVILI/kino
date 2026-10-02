<script setup lang="ts">
import { ref, computed, useTemplateRef, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import IconLoader from '@/components/shared/IconLoader.vue'
import AppLink from '@/components/shared/AppLink.vue';
const model = defineModel<string | null>({ default: null })

const props = withDefaults(
    defineProps<{
        placeholder?: string
    }>(),
    {
        placeholder: 'Search films and live events',
    },
)
const isFocused = ref(false)
const toggleExit = computed<boolean>(() => typeof model.value === 'string' && model.value.length > 2)
const toggleMagnifyingGlass = computed<boolean>(() => !isFocused.value || typeof model.value === 'string' && model.value.length > 0)
const toggleSearchBox = computed<boolean>(() => isFocused.value)

// Close the search box after any navigation (also fires when linking to the current page)
const inputRef = useTemplateRef<HTMLInputElement>('input')
const removeAfterEach = useRouter().afterEach(() => inputRef.value?.blur())
onUnmounted(removeAfterEach)

</script>
<template>
    <div class="relative">
        <div class="search">
            <IconLoader v-if="toggleMagnifyingGlass" :name="'MagnifyingGlass'" />
            <input ref="input" v-model="model" type="text" :placeholder="placeholder" v-bind="$attrs"
                @focus="isFocused = true" @blur="isFocused = false" />
            <IconLoader v-if="toggleExit" :name="'Clear'" class="text-[24px]" @click="model = null" />
        </div>
        <div v-if="toggleSearchBox" class="search-box" @mousedown.prevent>
            <div class="content">
                <div class="flex flex-col gap-1.5 items-center">
                    <IconLoader :name="'Popcorn'" class="text-5xl text-white" />
                    <span class="text-primary text-label-m mt-3.5">What do you want to watch?</span>
                    <span class="text-primary text-body-m">Search by title, director or cast</span>
                    <AppLink :to="{ name: 'sessions' }" class="btn-transparent mt-4">Browse all sessions</AppLink>
                </div>
            </div>
        </div>
    </div>
</template>