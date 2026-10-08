<script setup lang="ts">
import { ref, computed, useTemplateRef, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import IconLoader from '@/components/shared/IconLoader.vue'
import EmptyBox from '@/components/ui/SearchBar/EmptyBox.vue'
import EmptyList from '@/components/ui/SearchBar/EmptyList.vue'
import MovieList from '@/components/ui/SearchBar/MovieList.vue'
import MovieListSkeleton from '@/components/ui/SearchBar/MovieListSkeleton.vue'
import { useApiStore } from '@/stores/api'
import type { Movie } from '@/types'
const api = useApiStore()
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
const toggleExit = computed<boolean>(
  () => typeof model.value === 'string' && model.value.length > 2,
)
const toggleMagnifyingGlass = computed<boolean>(
  () => !isFocused.value || (typeof model.value === 'string' && model.value.length > 0),
)
const toggleSearchBox = computed<boolean>(() => isFocused.value)

const movies = ref<Movie[] | null>(null)
// True from the first keystroke until the latest search responds (covers debounce delay too)
const isSearching = ref(false)

// Incremented per search, so responses of outdated requests are ignored
let latestRequestId = 0

async function search() {
  const requestId = ++latestRequestId
  if (!model.value) return

  const response = await api
    .get<{ data: Movie[] }>('search', 'search', { params: { q: model.value } })
    .catch(() => null)
  if (requestId !== latestRequestId) return

  movies.value = response?.data ?? []
  isSearching.value = false
}

watch(model, () => {
  isSearching.value = !!model.value
  // Cleared input starts over, so the next search shows the skeleton instead of old results
  if (!model.value) movies.value = null
})
watchDebounced(model, search, { debounce: 300 })

// Close the search box after any navigation (also fires when linking to the current page)
const inputRef = useTemplateRef<HTMLInputElement>('input')
const removeAfterEach = useRouter().afterEach(() => inputRef.value?.blur())
onUnmounted(removeAfterEach)
</script>
<template>
  <div class="search">
    <div class="field">
      <IconLoader v-if="toggleMagnifyingGlass" :name="'MagnifyingGlass'" />
      <input
        ref="input"
        v-model="model"
        type="text"
        :placeholder="placeholder"
        v-bind="$attrs"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <IconLoader v-if="toggleExit" :name="'Clear'" class="text-[24px]" @click="model = null" />
    </div>
    <div v-if="toggleSearchBox" class="box" @mousedown.prevent>
      <div v-if="!model || !model.length" class="content">
        <EmptyBox />
      </div>
      <div v-else>
        <!-- Previous results stay visible while the next search loads -->
        <MovieList v-if="movies?.length" :data="movies" :query="model" />
        <MovieListSkeleton v-else-if="isSearching" />
        <div v-else class="content">
          <EmptyList :query="model" />
        </div>
      </div>
    </div>
  </div>
</template>
