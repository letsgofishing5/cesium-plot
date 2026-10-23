import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cesiumAssets } from './plugins/cesium'

export default defineConfig({
  plugins: [vue(), cesiumAssets()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'cesium-plot': fileURLToPath(new URL('../../packages/cesium-plot/src/index.ts', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ['cesium-plot']
  }
})
