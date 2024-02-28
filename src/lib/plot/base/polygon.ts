import { FeatureBase } from '../base'

import { getMousePosition } from '@/lib/utils'
import { Point } from '../src'
import { DrawEvents } from '@/lib/plot/config'
import type { GeoJsonFeaturesExtend, MouseEvent } from '../types'
export default class PolygonBase extends FeatureBase {
  /**
   * 上一个控制点的坐标位置
   */
  preControlPointPosition?: [number, number, number]
  constructor(config: any) {
    super(config)
    this.geometryType = 'Polygon'
    this.prompt.setText('单击确定起点位置')
  }
  getStyle(): { [key: string]: any } {
    const style: { [key: string]: any } = {}
    style.fill = this.entity?.polygon?.fill?.getValue(new Cesium.JulianDate())
    style.material = this.entity?.polygon?.material?.getValue(new Cesium.JulianDate())
    style.color = style.material?.color
    style.height = this.entity?.polygon?.height?.getValue(new Cesium.JulianDate())
    style.heightReference = this.entity?.polygon?.heightReference?.getValue(new Cesium.JulianDate())
    style.outline = this.entity?.polygon?.outline?.getValue(new Cesium.JulianDate())
    style.outlineColor = this.entity?.polygon?.outlineColor?.getValue(new Cesium.JulianDate())
    style.outlineWidth = this.entity?.polygon?.outlineWidth?.getValue(new Cesium.JulianDate())
    return style
  }
  setStyle(params: { [key: string]: any }): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color|material/gi.test(key)) continue
        ; (this.entity.polygon as any)[key] = params[key] as any
    }
    this.entity.polygon!.material =
      params.color && (Cesium.Color.fromCssColorString(params.color) as any)
    this.entity.polygon!.outlineColor =
      params.outlineColor && (Cesium.Color.fromCssColorString(params.outlineColor) as any)
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
  mouseLeftBounceUp(): void {
    this.preControlPointPosition = undefined
  }
  unSelected(params?: any): void {
    this.pointFeatures.forEach((item) => {
      item[1].remove()
    })
    this.pointFeatures.clear()
  }
  selected(params?: any) {
    this.listener.emit(DrawEvents.CREATED, { geojson: this.toGeoJSON() })
    if (this.pointFeatures.size) return
    this.vertexs.forEach((item, idx) => {
      this.createControlPointPrimitive(idx, item)
    })
  }
  onRightClick(event: MouseEvent): void {
    this.removeVertex(this.vertexs.length - 2)
    if (this.vertexs.length === 2) {
      this.prompt.setText('单击选中下一个点位置，右击回撤一步')
    } else if (this.vertexs.length >= 3) {
      this.prompt.setText('单击选中下一个点位置，双击完成绘制，右击回撤一步')
    }
  }
  removeVertex(idx: number): void {
    if (idx < 0 || idx >= this.vertexs.length) return
    if (idx <= 0) {
      this.remove()
      this.vertexs = []
      this.finish()
      return
    }
    this.vertexs.splice(idx, 1)
    this.currentVertexIdx = this.vertexs.length - 1
    this.removeCoordinates(idx)
    if (!this.entity) return
    this.entity.polyline!.show = (this.vertexs.length === 2) as any
  }
  move(cartesian: Cesium.Cartesian2, id?: string | undefined): void {
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
    // 否则就是操作整个图元
    if (this.preControlPointPosition && this.preControlPointPosition.length && lonlat) {
      const lon = lonlat[0] - this.preControlPointPosition[0]
      const lat = lonlat[1] - this.preControlPointPosition[1]
      this.vertexs.forEach((item) => {
        item[0] += lon
        item[1] += lat
      })
      this.setVertexs(this.vertexs)
    }
    if (lonlat) {
      this.preControlPointPosition = lonlat
    }
  }
  isValidGeoJSON(): boolean {
    if (this.vertexs.length < 3) return false
    if (this.vertexs.length === 2) {
      const p1 = Cesium.Cartesian3.fromDegrees(...this.vertexs[0])
      const p2 = Cesium.Cartesian3.fromDegrees(...this.vertexs[1])
      const p3 = Cesium.Cartesian3.fromDegrees(...this.vertexs[2])
      let distance = Cesium.Cartesian3.distance(p1, p2)
      if (!distance) return false
      distance = Cesium.Cartesian3.distance(p3, p2)
      if (!distance) return false
      distance = Cesium.Cartesian3.distance(p3, p1)
      if (!distance) return false
      return true
    }
    return true
  }
  createFromGeoJSON(json: GeoJsonFeaturesExtend) {
    const { geometry, properties, id } = json
    this.id = id
    this.setVertexs(geometry.coordinates.flat())
    this.createPrimitve()
    this.stores.addFeature(this)
    this.properties = properties
  }
  toGeoJSON() {
    return {
      id: this.id,
      featureConstructorName: this.constructor.name,
      type: 'Feature',
      properties: { style: { ...this.getStyle() }, ...this.properties },
      geometry: {
        coordinates: [[...this.vertexs, this.vertexs[0]]],
        type: this.geometryType
      }
    } as GeoJsonFeaturesExtend
  }
}
