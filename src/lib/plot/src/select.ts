import { FeatureBase } from '../base'
import { getPosition, pickEntity } from '@/lib/utils'

import type { MouseEvent } from '../types'
export default class Select extends FeatureBase {
  screenEventHandler: Cesium.ScreenSpaceEventHandler
  feature: FeatureBase | undefined
  selectIdx?: number
  constructor(config: any) {
    super(config)
    this.screenEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.feature = undefined
    this.id = ''
  }
  start(): void {
    this.currentVertexIdx = 0
      ; (this.viewer.container as HTMLElement).style.cursor = 'default'
  }
  stop(): void {
    this.feature?.unSelected()
  }
  onClick(event: MouseEvent): void {
    const { position, lonlat } = event
    if (!lonlat) {
      this.unSelected()
      return
    }
    // 拾取entity
    const id = pickEntity(this.viewer, position)
    if (!id) {
      this.unSelected()
      return
    }
    if (this.feature?.id !== id) {
      this.feature?.unSelected()
    }
    this.feature = this.stores.getFeature(id)
    // 选中回调
    this.feature?.selected(lonlat)
  }
  unSelected(params?: any): void {
    this.prompt.close()
    this.feature?.unSelected()
    this.feature = undefined
  }

  onRightClick(event: MouseEvent): void {
    // 取消选择回调
    if (!this.feature) return
    const { position } = event
    this.prompt.moveRightMenu(position)
    this.prompt.showRightMenu([['delete', this.deleteCallback.bind(this)]])
  }
  onLeftDown(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat || !this.entity) return
    this.id = pickEntity(this.viewer, position)
    if (!this.id) return
    if (this.feature?.pointFeatures.has(this.id) || (this.feature && this.feature.id === this.id)) {
      this.screenEventHandler.setInputAction(
        this.mouseMoveCallback.bind(this),
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      )
    }
  }
  onLeftUp(event: MouseEvent): void {
    this.viewer.scene.screenSpaceCameraController.enableRotate = true
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.feature?.mouseLeftBounceUp()
  }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) return
    const primitive = this.viewer.scene.pick(position)
      ; (this.viewer.container as HTMLElement).style.cursor = primitive ? 'pointer' : 'default'
  }
  /**
   * 鼠标移动回调函数
   * @param mouseEvent
   * @returns
   */
  mouseMoveCallback(mouseEvent: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    const cartesian = getPosition(this.viewer, mouseEvent.endPosition)
    if (!this.feature) return
    this.viewer.scene.screenSpaceCameraController.enableRotate = false
    // 移动回调
    cartesian && this.feature?.move(mouseEvent.endPosition, this.id)
  }
  /**
   * 删除回调函数
   */
  deleteCallback() {
    this.prompt.close()
    this.feature?.remove()
    this.stores.deleteFeature(this.feature?.id || '')
    this.feature = undefined
  }
}
