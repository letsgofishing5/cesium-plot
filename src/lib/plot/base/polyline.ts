import { FeatureBase } from '../base'

import { getMousePosition } from '../../../lib/utils'
import { Point } from '../src'
import { DrawEvents } from '@/lib/plot/config'
import type { GeoJsonFeaturesExtend, MouseEvent } from '../types'

export default class PolylineBase extends FeatureBase {
  /**
   * 上一个控制点的坐标位置
   */
  preControlPointPosition?: [number, number, number]
  constructor(config: any) {
    super(config)
    this.geometryType = 'LineString'
    this.prompt.setText('单击确定线段起点位置')
  }
  getStyle(): { [key: string]: any } {
    const style: { [key: string]: any } = {}
    style.material = this.entity?.polyline?.material?.getValue(new Cesium.JulianDate())
    style.color = style.material?.color
    style.width = this.entity?.polyline?.width?.getValue(new Cesium.JulianDate())
    style.clampToGround = this.entity?.polyline?.clampToGround?.getValue(new Cesium.JulianDate())
    return style
  }
  setStyle(params: { [key: string]: any }): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color|material/gi.test(key)) continue
        ; (this.entity.polyline as any)[key] = params[key] as any
    }
    this.entity.polyline!.material =
      params.color && (Cesium.Color.fromCssColorString(params.color) as any)
  }
  /**
   * 创建图元的控制点
   * @param idx
   * @param position
   * @returns
   */
  createControlPointPrimitive(idx: number, position: MouseEvent['lonlat']) {
    if (!position) return
    const point = new Point(this)
    point.createPrimitve()
    point.setVertexs(position)
    this.pointFeatures.set(point.id, [idx, point])
  }
  selected(cartesian: [number, number, number]) {
    this.listener.emit(DrawEvents.CREATED, { geojson: this.toGeoJSON() })
    if (this.pointFeatures.size) return
    this.vertexs.forEach((item, idx) => {
      this.createControlPointPrimitive(idx, item)
    })
  }
  unSelected(): void {
    this.pointFeatures.forEach((item) => {
      item[1].remove()
    })
    this.pointFeatures.clear()
  }

  /**
   * 鼠标左键弹起
   */
  mouseLeftBounceUp(): void {
    this.preControlPointPosition = undefined
  }
  move(cartesian: Cesium.Cartesian2, id?: string): void {
    // 转换移动过程中的坐标经纬度
    const { lonlat } = getMousePosition(this.viewer, cartesian)
    // 如果传递了下标，则代表当前的移动操作是操作某个点的
    if (typeof id !== 'undefined' && this.id !== id && lonlat) {
      this.preControlPointPosition = undefined
      const point = this.pointFeatures.get(id)
      if (!point) return
      // 更新点
      this.updateVertex(point[0], lonlat)
      point[1]?.setVertexs(lonlat)
      return
    }
    if (!this.preControlPointPosition) {
      this.preControlPointPosition = lonlat
    }
    // 否则就是操作整个线条
    if (this.preControlPointPosition && this.preControlPointPosition.length && lonlat) {
      const lon = lonlat[0] - this.preControlPointPosition[0]
      const lat = lonlat[1] - this.preControlPointPosition[1]
      this.vertexs.forEach((item) => {
        item[0] += lon
        item[1] += lat
      })
      this.setCoordinates(this.vertexs)
    }
    if (lonlat) {
      this.preControlPointPosition = lonlat
    }
  }
  removeVertex(idx: number): void {
    if (idx < 0 || idx >= this.vertexs.length) return
    if (idx === 0) {
      this.remove()
      this.vertexs = []
      this.finish()
      return
    }
    this.vertexs.splice(idx, 1)
    this.currentVertexIdx = this.vertexs.length - 1
    this.removeCoordinates(idx)
  }

  isValidGeoJSON(): boolean {
    if (!this.vertexs.length) return false
    if (this.vertexs.length === 2) {
      const p1 = Cesium.Cartesian3.fromDegrees(...this.vertexs[0])
      const p2 = Cesium.Cartesian3.fromDegrees(...this.vertexs[1])
      const distance = Cesium.Cartesian3.distance(p1, p2)
      if (!distance) {
        return false
      }
    }
    return true
  }
  toGeoJSON() {
    return {
      id: this.id,
      featureConstructorName: this.constructor.name,
      type: 'Feature',
      properties: { style: { ...this.getStyle() }, ...this.properties },
      geometry: {
        coordinates: this.vertexs,
        type: this.geometryType
      }
    } as GeoJsonFeaturesExtend
  }
  createFromGeoJSON(json: GeoJsonFeaturesExtend) {
    const { geometry, properties, id } = json
    this.id = id
    this.setVertexs(geometry.coordinates)
    this.createPrimitve()
    this.stores.addFeature(this)
    this.properties = properties
  }
}
