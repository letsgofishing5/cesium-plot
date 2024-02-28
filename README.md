## 安装

```bash
pnpm i cesium-plot@latest
```



## 静态资源

在index.html中全局引入Cesium

```html
<link rel="stylesheet" href="./cesium/Widgets/widgets.css">
<script src="./cesium/Cesium.js"></script>
```

## 创建标绘对象

```ts
import {Plot} from "cesium-plot"
const viewer = new Cesium.Viewer("cesiumContainer")
const plot = new Plot({viewer})
```



## 常用API

| 方法名称          | 参数                   | 说明                                                         |
| ----------------- | ---------------------- | ------------------------------------------------------------ |
| changeMode        | (String,Boolean)=>void | 第一个参数是模式，不填写默认Select，第二个参数用来控制是否连续绘制，默认为true，连续绘制模式 |
| export            | ()=>GeoJson[]          | 导出标绘的数据，符合Geojson格式的数据                        |
| load              | (geojson)=>void        | 导入一组符合Geojson格式的数据，回显图元                      |
| removeAll         | ()=>void               | 清除所有图元                                                 |
| updateEntityStyle | （style）=>void        | 更新选中的图元样式                                           |



## 模式

| 模式         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| Point        | 点                                                           |
| Polyline     | 线                                                           |
| Polygon      | 面                                                           |
| Label        | 文字                                                         |
| LabelClamp   | 贴地文字                                                     |
| PolygonArrow | 箭头                                                         |
| Pencil       | 画笔                                                         |
| Select       | 选中模式，即普通模式，可以选中绘制的图元，对选中的图元进行拖拽等操作 |

## 回调监听

```ts
const plot = new Plot({viewer})
//创建结束 监听
plot.on('created', (plotObj: { geojson: { [key: string]: any } }) => {
  isEdit.value = true
  const { geojson } = plotObj
  const { properties, featureConstructorName, id } = geojson
  const { style } = properties
  currentPlot.value = id
  propsType.value.type = featureConstructorName
  propsType.value.propsConfig = style
})
```

