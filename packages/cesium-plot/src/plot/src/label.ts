import * as Cesium from 'cesium'
import PointBase from '../base/point'
import { colorToCss } from '../../utils'
import type { LabelStyle, MouseEvent } from '../types'
export default class Label extends PointBase {
  static readonly type = 'Label' as const
  constructor(config: any) {
    super(config)
    this.prompt.setText('单击确定文字位置')
  }
  getStyle(): LabelStyle {
    const now = new Cesium.JulianDate()
    return {
      text: this.entity?.label?.text?.getValue(now),
      showBackground: this.entity?.label?.showBackground?.getValue(now),
      scale: this.entity?.label?.scale?.getValue(now) || 1,
      heightReference: this.entity?.label?.heightReference?.getValue(now),
      backgroundColor: colorToCss(this.entity?.label?.backgroundColor?.getValue(now)),
      backgroundPadding: this.entity?.label?.backgroundPadding?.getValue(now),
      fillColor: colorToCss(this.entity?.label?.fillColor?.getValue(now)),
      outlineColor: colorToCss(this.entity?.label?.outlineColor?.getValue(now)),
      outlineWidth: this.entity?.label?.outlineWidth?.getValue(now)
    }
  }
  setStyle(params: LabelStyle): void {
    if (!this.entity) return
    for (const key in params) {
      if (/color/gi.test(key)) continue
        ; (this.entity.label as any)[key] = (params as Record<string, unknown>)[key] as any
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
