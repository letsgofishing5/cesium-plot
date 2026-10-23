import { Plot, type GeoJson, type PlotMode, type PointStyle } from 'cesium-plot'

declare const plot: Plot

/* ------------------------------ 绘制模式 ------------------------------ */
const mode: PlotMode = 'Point'
plot.changeMode(mode, false)

// @ts-expect-error 非法模式
const badMode: PlotMode = 'Point2'
void badMode

/* -------------------------------- 事件 -------------------------------- */
plot.on('created', ({ geojson }) => {
  const name = geojson.featureConstructorName
  void name
})

// @ts-expect-error 未定义的事件名
plot.on('unknown', () => {})

/* -------------------------------- 样式 -------------------------------- */
const style: PointStyle = { color: '#ff0000', pixelSize: 8 }
plot.updateEntityStyle('id', style)

// @ts-expect-error 颜色不接受数字
const badStyle: PointStyle = { color: 0xff0000 }
void badStyle

/* ------------------------------- 导入导出 ------------------------------ */
const data: GeoJson = plot.export()
plot.load(data)
