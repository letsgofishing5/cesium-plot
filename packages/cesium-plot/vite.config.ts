import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import VitePluginStyleInject from 'vite-plugin-style-inject'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
      mangle: {
        properties: false
      }
    },
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'cesium-plot',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named'
      }
    }
  },
  plugins: [
    dts({ outDir: 'dist/types', insertTypesEntry: false, rollupTypes: false }),
    VitePluginStyleInject()
  ]
})
