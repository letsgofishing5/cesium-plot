import type * as Cesium from 'cesium'

/**
 * 经纬度 + 高度，[经度, 纬度, 高度]
 */
export type LonLatHeight = [number, number, number]

/**
 * 绘制模式
 */
export type PlotMode =
  | 'Point'
  | 'Polyline'
  | 'Polygon'
  | 'Label'
  | 'LabelClamp'
  | 'PolygonArrow'
  | 'Pencil'
  | 'Select'

/**
 * 可被序列化存储的图元类型（Select 不入数据仓）
 */
export type FeatureType = Exclude<PlotMode, 'Select'>

/**
 * 鼠标在屏幕上的经纬度与 cartesian3
 */
export type MouseEvent = {
  lonlat: undefined | LonLatHeight
  cartesian3: undefined | Cesium.Cartesian3
  position: Cesium.Cartesian2
}

/**
 * geojson 几何类型
 */
export type GeoJsonGeometryType = 'Point' | 'LineString' | 'Polygon'

/* -------------------------------------------------------------------------- */
/*                                   样式                                      */
/* -------------------------------------------------------------------------- */

/**
 * 颜色统一使用 css 颜色字符串，运行时转换为 Cesium.Color
 */
export type CssColor = string

/** 点样式 */
export interface PointStyle {
  color?: CssColor
  pixelSize?: number
  outlineColor?: CssColor
  outlineWidth?: number
  heightReference?: Cesium.HeightReference
}

/** 线样式（Polyline / Pencil 共用） */
export interface PolylineStyle {
  color?: CssColor
  width?: number
  clampToGround?: boolean
}

/** 面样式（Polygon / PolygonArrow 共用） */
export interface PolygonStyle {
  color?: CssColor
  fill?: boolean
  height?: number
  heightReference?: Cesium.HeightReference
  outline?: boolean
  outlineColor?: CssColor
  outlineWidth?: number
}

/** 文字样式 */
export interface LabelStyle {
  text?: string
  font?: string
  scale?: number
  fillColor?: CssColor
  outlineColor?: CssColor
  outlineWidth?: number
  backgroundColor?: CssColor
  showBackground?: boolean
  backgroundPadding?: Cesium.Cartesian2
  heightReference?: Cesium.HeightReference
}

/** 贴地文字样式（canvas 绘制成图片材质） */
export interface LabelClampStyle {
  text?: string
  fillStyle?: CssColor
  fontSize?: number
  fontFamily?: string
  outline?: boolean
  outlineWidth?: number
  outlineColor?: CssColor
}

/** 图元类型 -> 样式类型 */
export interface FeatureStyleMap {
  Point: PointStyle
  Polyline: PolylineStyle
  Polygon: PolygonStyle
  Label: LabelStyle
  LabelClamp: LabelClampStyle
  PolygonArrow: PolygonStyle
  Pencil: PolylineStyle
}

/** 指定图元类型的样式 */
export type FeatureStyle<T extends FeatureType> = FeatureStyleMap[T]

/** 任意图元样式 */
export type AnyFeatureStyle = FeatureStyleMap[FeatureType]

/* -------------------------------------------------------------------------- */
/*                                   GeoJSON                                   */
/* -------------------------------------------------------------------------- */

/**
 * Feature 的 properties，除 style 外可携带任意业务属性
 */
export interface GeoJsonProperties {
  style?: AnyFeatureStyle
  [key: string]: unknown
}

interface GeoJsonFeatureCommon {
  type: 'Feature'
  id: string
  properties: GeoJsonProperties
}

/** 点类图元：Point、Label */
export interface GeoJsonPointFeature extends GeoJsonFeatureCommon {
  featureConstructorName: 'Point' | 'Label'
  properties: GeoJsonProperties & { style?: PointStyle | LabelStyle }
  geometry: {
    type: 'Point'
    coordinates: LonLatHeight
  }
}

/** 线类图元：Polyline、Pencil */
export interface GeoJsonLineFeature extends GeoJsonFeatureCommon {
  featureConstructorName: 'Polyline' | 'Pencil'
  properties: GeoJsonProperties & { style?: PolylineStyle }
  geometry: {
    type: 'LineString'
    coordinates: LonLatHeight[]
  }
}

/** 面类图元：Polygon、PolygonArrow、LabelClamp */
export interface GeoJsonPolygonFeature extends GeoJsonFeatureCommon {
  featureConstructorName: 'Polygon' | 'PolygonArrow' | 'LabelClamp'
  properties: GeoJsonProperties & { style?: PolygonStyle | LabelClampStyle }
  geometry: {
    type: 'Polygon'
    coordinates: LonLatHeight[][]
  }
}

/**
 * GeoJSON Feature，按 featureConstructorName 判别几何类型
 */
export type GeoJsonFeature = GeoJsonPointFeature | GeoJsonLineFeature | GeoJsonPolygonFeature

/**
 * 兼容旧命名，2.0.0 起等价于 GeoJsonFeature
 */
export type GeoJsonFeaturesExtend = GeoJsonFeature

/** 导出/导入的数据结构 */
export interface GeoJson {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

/* -------------------------------------------------------------------------- */
/*                                    事件                                     */
/* -------------------------------------------------------------------------- */

/** 事件名 -> 回调参数 */
export interface PlotEventMap {
  /** 图元创建完成 / 选中已有图元 */
  created: { geojson: GeoJsonFeature }
}
