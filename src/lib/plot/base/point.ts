import { getPosition } from '@/lib/utils'
import { FeatureBase } from '../base'
import { DrawEvents } from '@/lib/plot/config'
export default class PointBase extends FeatureBase {
  constructor(config: any) {
    super(config)
    this.geometryType = 'Point'
    this.prompt.setText('单击确定点位置')
  }
  selected() {
    this.listener.emit(DrawEvents.CREATED, { geojson: this.toGeoJSON() })
  }
  getStyle(): { [key: string]: any } {
    const style: { [key: string]: any } = {}
    style.color = this.entity?.point?.color?.getValue(new Cesium.JulianDate())
    style.pixelSize = this.entity?.point?.pixelSize?.getValue(new Cesium.JulianDate())
    style.heightReference = this.entity?.point?.heightReference?.getValue(new Cesium.JulianDate())
    style.outlineColor = this.entity?.point?.outlineColor?.getValue(new Cesium.JulianDate())
    style.outlineWidth = this.entity?.point?.outlineWidth?.getValue(new Cesium.JulianDate())
    return style
  }
  setStyle(params: { [key: string]: any }): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color/gi.test(key)) continue
        ; (this.entity.point as any)[key] = params[key] as any
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
