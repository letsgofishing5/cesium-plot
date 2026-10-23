
import PolygonBase from '../base/polygon'
import type { MouseEvent } from '../types'
export default class Polygon extends PolygonBase {
  constructor(config: any) {
    super(config)
  }
  onClick(event: MouseEvent): void {
    const now = new Date().getTime()
    if (now - this.currentTimeStamp < 300) return
    this.currentTimeStamp = now
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.close()
    }
    this.addVertex(lonlat)
    // 根据点数量给出对应的提示词
    if (this.vertexs.length === 2) {
      this.prompt.setText('单击选中下一个点位置，右击回撤一步')
    } else if (this.vertexs.length >= 3) {
      this.prompt.setText('单击选中下一个点位置，双击完成绘制，右击回撤一步')
    }
    if (this.vertexs.length <= 2) {
      this.createPrimitve()
    } else if (this.vertexs.length > 2) {
      if (!this.entity) return
      this.entity.polyline!.show = false as any
    }
  }

  onDbClick(event: MouseEvent): void {
    this.removeVertex(this.currentVertexIdx)
    this.finish()
  }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.movePrompt(position)
    this.updateVertex(this.currentVertexIdx, lonlat)
  }
  setCoordinates(coordinates: any): void {
    this.coordinates = Cesium.Cartesian3.fromDegreesArrayHeights(coordinates.flat())
  }
  getPolylineCoordinates() {
    if (this.vertexs.length < 2) return [new Cesium.Cartesian3(), new Cesium.Cartesian3()]
    return Cesium.Cartesian3.fromDegreesArrayHeights([...this.vertexs[0], ...this.vertexs[1]])
  }
  createPrimitve(params?: any): void {
    const showPolyline = this.vertexs.length <= 2
    this.entity = this.viewer.entities.add({
      id: this.id,
      polyline: {
        show: showPolyline,
        positions: new Cesium.CallbackProperty(() => {
          return this.getPolylineCoordinates()
        }, false),
        width: 2
        // material: Cesium.Color.fromCssColorString('#f1c40f').withAlpha(0.4)
      },
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(this.coordinates)
        }, false),
        fill: true,
        height: 0,
        // material: Cesium.Color.fromCssColorString('#f1c40f').withAlpha(0.4),
        outlineWidth: 12
        // outlineColor: Cesium.Color.fromCssColorString('#f1c40f').withAlpha(0.4)
      }
    })
  }
}
