import * as Cesium from 'cesium'
import { getPosition } from '../../utils'
import { FeatureBase } from '../base'
import { DrawEvents } from '../config'
import type { PointStyle, PointStyleSnapshot } from '../types'
export default class PointBase extends FeatureBase {
  constructor(config: any) {
    super(config)
    this.geometryType = 'Point'
    this.prompt.setText('单击确定点位置')
  }
  override selected() {
    this.listener.emit(DrawEvents.CREATED, { geojson: this.toGeoJSON() })
  }
  override getStyle(): PointStyleSnapshot {
    const style: { [key: string]: any } = {}
    style.color = this.entity?.point?.color?.getValue(new Cesium.JulianDate())
    style.pixelSize = this.entity?.point?.pixelSize?.getValue(new Cesium.JulianDate())
    style.heightReference = this.entity?.point?.heightReference?.getValue(new Cesium.JulianDate())
    style.outlineColor = this.entity?.point?.outlineColor?.getValue(new Cesium.JulianDate())
    style.outlineWidth = this.entity?.point?.outlineWidth?.getValue(new Cesium.JulianDate())
    return style
  }
  override setStyle(params: PointStyle): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color/gi.test(key)) continue
        ; (this.entity.point as any)[key] = (params as Record<string, unknown>)[key] as any
    }
    this.entity.point!.color =
      params.color && (Cesium.Color.fromCssColorString(params.color) as any)
    this.entity.point!.outlineColor =
      params.outlineColor && (Cesium.Color.fromCssColorString(params.outlineColor) as any)
  }
  override move(cartesian: Cesium.Cartesian2) {
    const cartesian3 = getPosition(this.viewer, cartesian)
    if (!cartesian3) return
    if (!this.entity) return
    this.entity.position = cartesian3 as any
  }
}
