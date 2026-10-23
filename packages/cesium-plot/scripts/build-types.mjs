import { copyFile, rm } from 'node:fs/promises'
import { rollup } from 'rollup'
import dts from 'rollup-plugin-dts'

/**
 * 将 tsc/vite-plugin-dts 产出的多文件声明打包成单文件，
 * 便于同时提供给 ESM(.d.ts) 与 CJS(.d.cts) 消费者。
 */
const bundle = await rollup({
  input: 'dist/types/index.d.ts',
  external: ['cesium'],
  plugins: [dts()]
})

await bundle.write({ file: 'dist/index.d.ts', format: 'es' })
await bundle.close()

await copyFile('dist/index.d.ts', 'dist/index.d.cts')
await rm('dist/types', { recursive: true, force: true })

console.log('[build-types] dist/index.d.ts + dist/index.d.cts')
