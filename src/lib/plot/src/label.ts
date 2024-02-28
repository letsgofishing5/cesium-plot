import PointBase from '../base/point'

import type { MouseEvent } from '../types'
export default class Label extends PointBase {
  constructor(config: any) {
    super(config)
    this.prompt.setText('单击确定文字位置')
  }
  getStyle(): { [key: string]: any } {
    const style: { [key: string]: any } = {}
    style.text = this.entity?.label?.text?.getValue(new Cesium.JulianDate())
    style.showBackground = this.entity?.label?.showBackground?.getValue(new Cesium.JulianDate())
    style.scale = this.entity?.label?.scale?.getValue(new Cesium.JulianDate()) || 1
    style.heightReference = this.entity?.label?.heightReference?.getValue(new Cesium.JulianDate())
    style.showBackground = this.entity?.label?.showBackground?.getValue(new Cesium.JulianDate())
    style.backgroundColor = this.entity?.label?.backgroundColor?.getValue(new Cesium.JulianDate())
    style.backgroundPadding = this.entity?.label?.backgroundPadding?.getValue(
      new Cesium.JulianDate()
    )
    style.fillColor = this.entity?.label?.fillColor?.getValue(new Cesium.JulianDate())
    style.outlineColor = this.entity?.label?.outlineColor?.getValue(new Cesium.JulianDate())
    style.outlineWidth = this.entity?.label?.outlineWidth?.getValue(new Cesium.JulianDate())
    return style
  }
  setStyle(params: { [key: string]: any }): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color/gi.test(key)) continue
        ; (this.entity.label as any)[key] = params[key] as any
    }
    this.entity.label!.fillColor =
      params.fillColor && (Cesium.Color.fromCssColorString(params.fillColor) as any)
    this.entity.label!.outlineColor =
      params.outlineColor && (Cesium.Color.fromCssColorString(params.outlineColor) as any)
    this.entity.label!.backgroundColor =
      params.backgroundColor && (Cesium.Color.fromCssColorString(params.backgroundColor) as any)
  }
  onClick(event: MouseEvent): void {
    const now = new Date().getTime()
    if (now - this.currentTimeStamp < 300) return
    this.currentTimeStamp = now
    if (!event.lonlat) return
    this.setVertexs(event.lonlat)
    this.createPrimitve()
    this.events.changeMode('Label', this)
  }
  createPrimitve(params?: any): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
      position: new Cesium.CallbackProperty(() => {
        return this.getCoordinates()[0]
      }, false) as any,
      label: {
        text: '你好',
        font: '24px sans-serif'
      }
    })
  }
}
