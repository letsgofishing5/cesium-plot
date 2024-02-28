
export type GeoJson = {
  type: 'FeatureCollection'
  features: Array<GeoJsonFeaturesExtend>
}

/**
 * 鼠标在屏幕上的经纬度与cartesian3
 */
export type MouseEvent = {
  lonlat: undefined | [number, number, number]
  cartesian3: undefined | Cesium.Cartesian3
  position: Cesium.Cartesian2
}
/**
 * geojson几何类型
 */
export type GeoJsonGeometryType = 'Point' | 'LineString' | 'Polygon'

/**
 * GeoJson的Features扩展类型，扩展我们自定义的属性
 */
export type GeoJsonFeaturesExtend = {
  [key: string]: any
} & GeoJsonFeature

/**
 * GeoJson的Features的互斥类型
 */
export type GeoJsonFeature = GeoJsonFeaturePoint | GeoJsonFeatureLineString | GeoJsonFeaturePolygon

/**
 * GeoJson的Type
 */
export type GeoJsonType = 'Feature'

/**
 * geojson中Point类型
 */
type GeoJsonFeaturePoint = {
  type: GeoJsonType
  geometry: {
    type: 'Point'
    coordinates: [number, number, number]
  }
  properties: {
    [key: string]: any
  }
  [key: string]: any
}

/**
 * geojson中LineString类型
 */
type GeoJsonFeatureLineString = {
  type: GeoJsonType
  geometry: {
    type: 'LineString'
    coordinates: Array<[number, number, number]>
  }
  properties: {
    [key: string]: any
  }
  [key: string]: any
}

/**
 * geojson中Polygon类型
 */
type GeoJsonFeaturePolygon = {
  type: GeoJsonType
  geometry: {
    type: 'Polygon'
    coordinates: Array<Array<[number, number, number]>>
  }
  properties: {
    [key: string]: any
  }
  [key: string]: any
}
