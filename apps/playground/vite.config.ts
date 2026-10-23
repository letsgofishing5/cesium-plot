import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cesiumAssets } from './plugins/cesium.ts'

export default defineConfig({
  // GitHub Pages 部署在子路径下
  base: process.env.GITHUB_ACTIONS ? '/cesium-plot/' : '/',
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
