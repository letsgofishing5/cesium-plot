import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

/**
 * 产出的 css 以内联 <style> 注入入口产物，
 * 保证使用方零配置引入即有样式。
 */
const MARK = '__cesium-plot-style__'
const ENTRIES = ['dist/index.js', 'dist/index.cjs']

function injectCss() {
  const cssFile = 'dist/style.css'
  if (!existsSync(cssFile)) return

  const css = readFileSync(cssFile, 'utf8')
  const snippet =
    `\n/*${MARK}*/\n;(function(){if(typeof document==='undefined')return;` +
    `var id='cesium-plot-style';if(document.getElementById(id))return;` +
    `var s=document.createElement('style');s.id=id;` +
    `s.textContent=${JSON.stringify(css)};document.head.appendChild(s)})()\n`

  for (const file of ENTRIES) {
    if (!existsSync(file)) continue
    const code = readFileSync(file, 'utf8')
    if (code.includes(MARK)) continue
    writeFileSync(file, code + snippet)
  }

  // 双格式都注入完成后再清理 css 产物
  if (ENTRIES.every((file) => existsSync(file) && readFileSync(file, 'utf8').includes(MARK))) {
    rmSync(cssFile)
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  // 输出 index.js / index.cjs + index.d.ts / index.d.cts
  fixedExtension: false,
  platform: 'browser',
  shims: false,
  deps: {
    neverBundle: ['cesium']
  },
  outputOptions: {
    // 单入口不需要 code splitting，避免额外的 runtime chunk
    codeSplitting: false
  },
  hooks: {
    'build:done': injectCss
  }
})
