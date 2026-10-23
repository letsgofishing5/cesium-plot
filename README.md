# cesium-plot

基于 Cesium 的基础标绘库，支持点、线、面、文字、贴地文字、箭头、画笔，以及 GeoJSON 导入导出、样式修改、选中/拖拽编辑等能力。

仓库采用 pnpm monorepo 结构：

```
cesium-plot/
├─ packages/cesium-plot/    # 标绘库本体（发布到 npm 的包）
├─ apps/playground/         # 演示项目（Vue 3 + Vite）
```

## 本地开发

环境要求：Node >= 20.19、pnpm 11。

```bash
pnpm install
pnpm dev          # 启动演示项目，默认 http://localhost:5173
```

演示项目通过 vite alias 直接引用 `packages/cesium-plot/src`，改动库源码会热更新，无需先构建。
首次启动会自动把 `node_modules/cesium` 的静态资源同步到 `apps/playground/public/cesium`（已 gitignore）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动演示项目 |
| `pnpm build:lib` | 构建标绘库（ESM + CJS + 单文件类型声明） |
| `pnpm build:demo` | 构建演示项目静态站点 |
| `pnpm preview` | 预览演示项目构建产物 |
| `pnpm typecheck` | 对各子包执行类型检查 |

## 库文档

见 [packages/cesium-plot/README.md](./packages/cesium-plot/README.md)。

## License

MIT
