import * as Cesium from 'cesium'

import PointBase from '../base/point'
import type { MouseEvent } from '../types'
export default class Point extends PointBase {
  constructor(config: any) {
    super(config)
  }
  override setCoordinates(vertexs: any) {
    this.coordinates = vertexs
  }
  override onClick(event: MouseEvent): void {
    if (!event.lonlat) return
    this.setVertexs(event.lonlat)
    this.createPrimitve()
    this.finish()
  }
  override createPrimitve(): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
      position: new Cesium.CallbackProperty(() => {
        const [lon, lat, height] = this.getCoordinates()
        return Cesium.Cartesian3.fromDegrees(lon, lat, height)
      }, false) as any,
      point: {
        // color: Cesium.Color.RED,
        pixelSize: 12,
        // outlineColor: Cesium.Color.GREEN,
        outlineWidth: 2
      }
    })
  }
}
