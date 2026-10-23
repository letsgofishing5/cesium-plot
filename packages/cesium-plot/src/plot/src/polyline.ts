
import PolylineBase from '../base/polyline'
import type { MouseEvent } from '../types'

export default class Polyline extends PolylineBase {
  constructor(config: any) {
    super(config)
  }
  onClick(event: MouseEvent): void {
    const now = new Date().getTime()
    if (now - this.currentTimeStamp < 300) return
    this.currentTimeStamp = now
    const { lonlat } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.setText('单击选中下一个点位置，双击完成绘制，右击回撤一步')
    this.addVertex(lonlat)
    if (this.getVertexs().length === 1) {
      this.addVertex(lonlat)
      this.createPrimitve()
    }
  }
  onDbClick(event: MouseEvent): void {
    this.vertexs.pop()
    this.finish()
  }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.movePrompt(position)
    if (this.vertexs.length < 1) return
    this.updateVertex(this.currentVertexIdx, lonlat)
  }
  onRightClick(event: MouseEvent): void {
    this.removeVertex(this.vertexs.length - 2)
  }
  createPrimitve(params?: any): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return this.coordinates
        }, false),
        // material: Cesium.Color.RED,
        width: 4
      }
    })
  }
}
