import { copyFile, rename, rm } from 'node:fs/promises'
import { rollup } from 'rollup'
import dts from 'rollup-plugin-dts'

/**
 * 将 vite-plugin-dts 产出的多文件声明打包成单文件，
 * 便于同时提供给 ESM(.d.ts) 与 CJS(.d.cts) 消费者。
 */
const TMP = 'dist/.dts-tmp/index.d.ts'

const bundle = await rollup({
  input: 'dist/index.d.ts',
  external: ['cesium'],
  plugins: [dts()]
})

await bundle.write({ file: TMP, format: 'es' })
await bundle.close()

// 用打包结果覆盖入口声明，并同步一份 CJS 声明
await rename(TMP, 'dist/index.d.ts')
await copyFile('dist/index.d.ts', 'dist/index.d.cts')

// 清理中间产物
await rm('dist/.dts-tmp', { recursive: true, force: true })
await rm('dist/plot', { recursive: true, force: true })
await rm('dist/utils', { recursive: true, force: true })

console.log('[build-types] dist/index.d.ts + dist/index.d.cts')
