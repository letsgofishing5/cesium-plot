# cesium-plot

基于 Cesium 的基础标绘库，内置点、线、面、文字、贴地文字、箭头、画笔，支持 GeoJSON 导入导出、样式修改、选中与拖拽编辑。

## 安装

```bash
pnpm i cesium-plot
```

## 快速开始

```ts
import { Plot } from 'cesium-plot'

const viewer = new Cesium.Viewer('cesiumContainer')
const plot = new Plot({ viewer })
```

## 常用 API

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `changeMode` | `(mode?: string, isContinue?: boolean) => void` | 切换绘制模式，不传默认 `Select`；`isContinue` 默认 `true` 表示连续绘制 |
| `export` | `() => GeoJson` | 导出标绘数据（GeoJSON FeatureCollection） |
| `load` | `(geojson: GeoJson) => void` | 导入并回显 GeoJSON 数据 |
| `removeAll` | `() => void` | 清除所有图元 |
| `updateEntityStyle` | `(id: string, style: object) => void` | 更新指定图元样式 |
| `on` / `un` | `(name: string, cb: Function) => void` | 注册 / 注销事件监听 |

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

## 事件监听

```ts
const plot = new Plot({ viewer })

plot.on('created', ({ geojson }) => {
  const { id, properties, featureConstructorName } = geojson
  console.log(id, featureConstructorName, properties.style)
})
```

## License

MIT
