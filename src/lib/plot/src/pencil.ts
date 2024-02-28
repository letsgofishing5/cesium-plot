
import { getMousePosition } from '@/lib/utils'
import PolylineBase from '../base/polyline'
import type { MouseEvent } from '../types'
export default class Pencil extends PolylineBase {
  constructor(config: any) {
    super(config)
    this.prompt.setText('鼠标左键按下移动鼠标开始画笔，鼠标左键弹起则画笔结束')
  }
  onLeftDown(event: MouseEvent): void {
    const { lonlat } = event
    if (!lonlat) return
    this.viewer.scene.screenSpaceCameraController.enableRotate = false
    this.addVertex(lonlat)
    this.createPrimitve()
    this.screenEventHandler.setInputAction(
      this.moveCallback.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    )
  }
  onLeftUp(event: MouseEvent): void {
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.viewer.scene.screenSpaceCameraController.enableRotate = true
    this.events.changeMode(Pencil, this)
  }
  moveCallback(event: Cesium.ScreenSpaceEventHandler.MotionEvent): void {
    const { lonlat } = getMousePosition(this.viewer, event.endPosition)
    if (!lonlat) return
    if (this.vertexs.length) {
      this.addVertex(lonlat)
    }
  }
  createPrimitve(params?: any): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return this.coordinates
        }, false),
        material: Cesium.Color.RED,
        width: 4
      }
    })
  }
}
