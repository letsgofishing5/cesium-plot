// cesium的事件

import { getMousePosition } from '../../utils'
import { FeatureBase } from '../base'
class CesiumEvents {
  /**
   * 屏幕事件管理器
   */
  screenEventHandler: Cesium.ScreenSpaceEventHandler
  mode: FeatureBase
  viewer: Cesium.Viewer
  featureCollection: any
  constructor(config: any) {
    const { viewer, mode, featureCollection } = config
    if (!(viewer instanceof Cesium.Viewer)) {
      throw new Error('viewer对象不正确：' + viewer)
    }
    this.mode = mode
    this.viewer = viewer
    this.featureCollection = featureCollection
    this.screenEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    this.addEventListeners()
  }

  changeMode<T extends typeof FeatureBase>(mode: T | string, options: { [key: string]: any }) {
    if (this.mode) this.mode.stop()
    if (typeof mode === 'string') {
      const C = this.featureCollection[mode]
      if (!C) return console.warn(`没有找到${mode}类`)
      this.mode = new this.featureCollection[mode](options)
    } else {
      this.mode = new mode(options)
    }
    this.mode.start()
    return this.mode
  }
  click(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onClick?.(position)
  }
  leftDown(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onLeftDown?.(position)
  }
  leftUp(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onLeftUp?.(position)
  }
  dbClick(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onDbClick?.(position)
  }
  mouseMove(event: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    const position = getMousePosition(this.viewer, event.endPosition)
    this.mode?.onMouseMove?.(position)
  }
  rightClick(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onRightClick?.(position)
  }
  mouseDown(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onMouseDown?.(position)
  }
  mouseUp(event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const position = getMousePosition(this.viewer, event.position)
    this.mode?.onMouseUp?.(position)
  }
  wheel(event: number) {
    this?.mode?.onWheel(event)
  }

  addEventListeners() {
    this.screenEventHandler.setInputAction(
      this.click.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    )
    this.screenEventHandler.setInputAction(
      this.dbClick.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    this.screenEventHandler.setInputAction(
      this.mouseMove.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    )
    this.screenEventHandler.setInputAction(
      this.rightClick.bind(this),
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    )
    this.screenEventHandler.setInputAction(
      this.leftDown.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_DOWN
    )
    this.screenEventHandler.setInputAction(
      this.leftUp.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_UP
    )
    this.screenEventHandler.setInputAction(this.wheel.bind(this), Cesium.ScreenSpaceEventType.WHEEL)
  }
  removeEventListeners() {
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
    this.screenEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)
  }
}
export default CesiumEvents
