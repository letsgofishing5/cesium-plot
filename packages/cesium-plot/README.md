# cesium-plot

基于 Cesium 的基础标绘库，内置点、线、面、文字、贴地文字、箭头、画笔，支持 GeoJSON 导入导出、样式修改、选中与拖拽编辑。内置完整的 TypeScript 类型。

## 安装

```bash
pnpm i cesium cesium-plot
```

`cesium` 是 peer 依赖，需与应用使用的 Cesium 版本保持一致。

## 前置：Cesium 静态资源

`cesium` 运行时会加载 `Workers`、`Assets`、`ThirdParty`、`Widgets` 等静态文件，需要把它们放到可访问的目录，并指定根路径：

```ts
window.CESIUM_BASE_URL = '/cesium/'
```

以 Vite 为例，把 `node_modules/cesium/Build/Cesium` 下的 `Workers/Assets/ThirdParty/Widgets` 复制到 `public/cesium/`（本仓库的演示项目已通过 `apps/playground/plugins/cesium.ts` 自动完成），并在 `index.html` 中引入 `./cesium/Widgets/widgets.css`。

## 快速开始

```ts
import * as Cesium from 'cesium'
import { Plot, type GeoJson } from 'cesium-plot'

const viewer = new Cesium.Viewer('cesiumContainer')
const plot = new Plot({ viewer })

// 绘制点，单次绘制
plot.changeMode('Point', false)
// 绘制面，连续绘制
plot.changeMode('Polygon')

// 事件回调具备完整类型推导
plot.on('created', ({ geojson }) => {
  console.log(geojson.featureConstructorName) // 'Point' | 'Polyline' | ...
  console.log(geojson.properties.style)
})

// 导出 / 导入
const data: GeoJson = plot.export()
plot.load(data)

// 更新样式：颜色直接使用 css 颜色字符串
plot.updateEntityStyle(id, { color: '#ff0000', width: 2 })
```

## API

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `changeMode` | `(mode?: PlotMode, isContinue?: boolean) => void` | 切换绘制模式，默认 `Select`；`isContinue` 默认 `true` |
| `export` | `() => GeoJson` | 导出标绘数据（GeoJSON FeatureCollection） |
| `load` | `(geojson: GeoJson) => void` | 导入并回显 GeoJSON 数据 |
| `removeAll` | `() => void` | 清除所有图元 |
| `updateEntityStyle` | `(id: string, style: AnyFeatureStyle) => void` | 更新指定图元样式 |
| `on` | `<K extends keyof PlotEventMap>(name: K, cb: (payload: PlotEventMap[K]) => void) => void` | 注册事件监听 |
| `un` | `(name: keyof PlotEventMap) => void` | 注销事件监听 |

## 绘制模式

| 模式 | 说明 |
| --- | --- |
| `Point` | 点 |
| `Polyline` | 线 |
| `Polygon` | 面 |
| `Label` | 文字 |
| `LabelClamp` | 贴地文字 |
| `PolygonArrow` | 箭头 |
| `Pencil` | 画笔 |
| `Select` | 选中模式，可选中图元并拖拽编辑 |

## 类型

库导出的主要类型：

| 类型 | 说明 |
| --- | --- |
| `PlotMode` | 全部绘制模式 |
| `FeatureType` | 可序列化的图元类型（不含 `Select`） |
| `GeoJson` / `GeoJsonFeature` | 导出数据，按 `featureConstructorName` 判别几何类型 |
| `PointStyle` / `PolylineStyle` / `PolygonStyle` / `LabelStyle` / `LabelClampStyle` | 各类图元的**写入**样式 |
| `*StyleSnapshot` | 各类图元的**读取**样式快照 |
| `FeatureStyleMap` / `AnyFeatureStyle` | 图元类型到写入样式的映射 |
| `FeatureStyleSnapshotMap` / `AnyFeatureStyleSnapshot` | 图元类型到读取样式的映射 |
| `PlotEventMap` | 事件名到回调参数的映射 |

写入样式（`setStyle` / `updateEntityStyle`）的颜色使用 css 颜色字符串；读取样式（`getStyle`，以及导出数据里的 `properties.style`）的颜色是运行时 `Cesium.Color`，两者用不同（`*Style` / `*StyleSnapshot`）的类型区分。

## License

MIT
