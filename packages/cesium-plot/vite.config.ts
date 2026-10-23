import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

/**
 * 构建时把抽离的 css 以内联 <style> 注入到入口 chunk，
 * 保证使用方零配置引入即有样式，同时不依赖第三方插件。
 */
function inlineCss(): Plugin {
  return {
    name: 'cesium-plot-inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssFiles = Object.keys(bundle).filter((file) => file.endsWith('.css'))
      if (!cssFiles.length) return
      const css = cssFiles
        .map((file) => String((bundle[file] as { source?: unknown }).source ?? ''))
        .join('\n')
      cssFiles.forEach((file) => delete bundle[file])
      const entry = Object.values(bundle).find((item) => item.type === 'chunk' && item.isEntry)
      if (!entry || entry.type !== 'chunk') return
      entry.code +=
        `\n;(function(){if(typeof document==='undefined')return;var id='cesium-plot-style';` +
        `if(document.getElementById(id))return;var s=document.createElement('style');` +
        `s.id=id;s.textContent=${JSON.stringify(css)};document.head.appendChild(s)})()\n`
    }
  }
}

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
  plugins: [dts({ outDir: 'dist/types', insertTypesEntry: false, rollupTypes: false }), inlineCss()]
})
