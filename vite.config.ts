import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
import VitePluginStyleInject from 'vite-plugin-style-inject';
const external = Object.keys(require('./package.json').dependencies || {});
console.log('external:', external);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    minify: "terser",
    terserOptions: {
      keep_classnames: true
    },
    lib: {
      entry: 'src/build.ts',
      name: 'cesium-plot',
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external,
      output: {
        exports: "named",
        globals: {
          Plot: "cesium-plot"
        }
      },
    },
  },
  plugins: [vue(), dts({ insertTypesEntry: true, rollupTypes: true }), VitePluginStyleInject()],
})
