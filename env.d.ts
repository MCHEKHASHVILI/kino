/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// @splidejs/vue-splide 0.6 ships its types as source that its package.json exports don't expose,
// so the components used here are declared against the core Splide options
declare module '@splidejs/vue-splide' {
  import type { DefineComponent } from 'vue'
  import type { Options } from '@splidejs/splide'

  export const Splide: DefineComponent<{ options?: Options; tag?: string; hasTrack?: boolean }>
  export const SplideSlide: DefineComponent
  export const SplideTrack: DefineComponent
}

// Plain CSS entry points of the same package
declare module '@splidejs/vue-splide/css/core'
