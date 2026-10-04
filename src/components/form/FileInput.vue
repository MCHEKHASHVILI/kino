<script setup lang="ts">
import { ref, watch, onBeforeUnmount, type Component } from 'vue'
import vueFilePond from 'vue-filepond'
import type { FilePondFile } from 'filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import 'filepond/dist/filepond.min.css'
import IconLoader from '@/components/shared/IconLoader.vue'

// vue-filepond ships Vue 2 style typings
const FilePond = vueFilePond(FilePondPluginFileValidateType) as Component

const model = defineModel<File | null>({ default: null })

withDefaults(
  defineProps<{
    label?: string
    title?: string
    description?: string
    optional?: boolean
    accept?: string[]
    errors?: string[]
  }>(),
  {
    title: 'Upload file',
    accept: () => ['image/*'],
  },
)

const pond = ref<{ removeFiles: () => void; browse: () => void } | null>(null)
const previewUrl = ref<string | null>(null)

function onUpdateFiles(items: FilePondFile[]) {
  const file = items[0]?.file
  model.value = file instanceof File ? file : null
}

function revokePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

watch(model, (value) => {
  revokePreview()
  if (value) previewUrl.value = URL.createObjectURL(value)
  // Parent reset the value (e.g. store reset after register), clear pond as well
  else pond.value?.removeFiles()
})

onBeforeUnmount(revokePreview)
</script>

<template>
  <div class="input-group relative w-full">
    <label v-if="label" v-text="label" :class="{ 'text-helper-red!': errors && errors.length }" />
    <div class="relative">
      <!--
        FilePond idle label accepts html string only, so UI is rendered here on top of it.
        While empty, pointer-events-none lets clicks and drops reach FilePond below.
        Once file is picked FilePond hides its drop label, so click opens browser manually
      -->
      <div
        class="absolute inset-0 z-10 flex items-center gap-3"
        :class="model ? 'cursor-pointer' : 'pointer-events-none'"
        @click="model && pond?.browse()"
      >
        <!-- Shared 40x40 tile, preview and upload icon get the same 8px radius -->
        <span class="upload-icon flex size-10 shrink-0">
          <img v-if="previewUrl" :src="previewUrl" alt="" class="size-full object-cover" />
          <IconLoader v-else name="Upload" class="text-[40px] text-disabled" />
        </span>
        <div class="flex flex-col justify-center gap-0.75">
          <span class="text-label-m text-primary">
            {{ title }}
            <span v-if="optional" class="text-primary">(Optional)</span>
          </span>
          <span v-if="description" class="text-body-s text-secondary" v-text="description" />
        </div>
      </div>
      <FilePond
        ref="pond"
        :allow-multiple="false"
        :accepted-file-types="accept"
        label-idle=""
        :credits="false"
        @updatefiles="onUpdateFiles"
      />
    </div>
    <div v-if="errors && errors.length" class="flex flex-col">
      <p v-for="error in errors" class="text-label-s text-helper-red" v-text="error" />
    </div>
  </div>
</template>

<style scoped>
/*
 * FilePond ships its own light theme, make it blend into the form.
 * Its file list is hidden (preview is rendered in icon area instead),
 * so field is locked to 40px, FilePond would otherwise grow to fit the list
 */
.input-group :deep(.filepond--root) {
  height: 40px !important;
  margin-bottom: 0;
  overflow: hidden;
  font-family: inherit;
}

.input-group :deep(.filepond--list-scroller) {
  display: none;
}

.input-group :deep(.filepond--panel-root) {
  background-color: transparent;
  border: 0;
}

.input-group :deep(.filepond--drop-label) {
  min-height: 40px;
}

/* Empty label stretched over whole drop area, so any click opens file browser */
.input-group :deep(.filepond--drop-label label) {
  width: 100%;
  height: 40px;
  padding: 0;
  cursor: pointer;
}

/* Upload.svg draws its own tile, paint it raised */
.upload-icon {
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--color-raised);
}

.upload-icon :deep(rect) {
  fill: var(--color-raised);
  fill-opacity: 1;
  stroke: var(--color-raised);
}
</style>
