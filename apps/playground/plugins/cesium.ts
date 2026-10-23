import { createRequire } from 'node:module'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const require = createRequire(import.meta.url)

/** cesium 运行时需要的静态资源目录 */
const ASSET_DIRS = ['Workers', 'Assets', 'ThirdParty', 'Widgets'] as const

/**
 * 将 node_modules/cesium 的静态资源同步到 public 目录，
 * 避免把几百个 cesium 文件提交进仓库。
 */
export function cesiumAssets(publicPath = 'cesium'): Plugin {
  return {
    name: 'cesium-assets',
    async configResolved(config) {
      const pkgPath = require.resolve('cesium/package.json')
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8')) as { version: string }
      const source = resolve(dirname(pkgPath), 'Build', 'Cesium')
      const target = resolve(config.root, 'public', publicPath)
      const marker = resolve(target, '.version')

      try {
        const cached = (await readFile(marker, 'utf-8')).trim()
        if (cached === pkg.version) return
      } catch {
        // 没有标记文件，走全量复制
      }

      await mkdir(target, { recursive: true })
      for (const dir of ASSET_DIRS) {
        await cp(resolve(source, dir), resolve(target, dir), { recursive: true, force: true })
      }
      await writeFile(marker, pkg.version)
      config.logger.info(`[cesium-assets] 已同步 cesium@${pkg.version} 静态资源到 public/${publicPath}`)
    }
  }
}
