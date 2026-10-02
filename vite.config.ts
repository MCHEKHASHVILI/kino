import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from https://<user>.github.io/kino/
  base: command === 'build' ? '/kino/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    svgLoader({
      // `import x from './a.svg'` stays a URL (matches vite/client types);
      // use `./a.svg?component` to get a Vue component.
      defaultImport: 'url',
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            // keep viewBox so icons scale with width/height/CSS
            params: { overrides: { removeViewBox: false } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
