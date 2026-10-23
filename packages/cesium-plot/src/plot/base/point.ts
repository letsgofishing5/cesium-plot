import * as Cesium from 'cesium'
import { colorToCss, getPosition } from '../../utils'
import { FeatureBase } from '../base'
import { DrawEvents } from '../config'
import type { PointStyle } from '../types'
export default class PointBase extends FeatureBase {
  constructor(config: any) {
    super(config)
    this.geometryType = 'Point'
    this.prompt.setText('单击确定点位置')
  }
  selected() {
    this.listener.emit(DrawEvents.CREATED, { geojson: this.toGeoJSON() })
  }
  getStyle(): PointStyle {
    const now = new Cesium.JulianDate()
    return {
      color: colorToCss(this.entity?.point?.color?.getValue(now)),
      pixelSize: this.entity?.point?.pixelSize?.getValue(now),
      heightReference: this.entity?.point?.heightReference?.getValue(now),
      outlineColor: colorToCss(this.entity?.point?.outlineColor?.getValue(now)),
      outlineWidth: this.entity?.point?.outlineWidth?.getValue(now)
    }
  }
  setStyle(params: PointStyle): void {
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
  move(cartesian: Cesium.Cartesian2) {
    const cartesian3 = getPosition(this.viewer, cartesian)
    if (!cartesian3) return
    if (!this.entity) return
    this.entity.position = cartesian3 as any
  }
}
