
import type { MouseEvent } from '../plot/types'
/**
 * 获取在地球上的位置，如果当前鼠标位置不在地球上，则返回undefined
 * @param viewer
 * @param position
 * @returns
 */
export function getPosition(
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian2
): Cesium.Cartesian3 | undefined {
  // 拾取一条射线
  return viewer.camera.pickEllipsoid(position)
}

/**
 * 将Cartesian3坐标转换成经纬度
 * @param cartesian
 * @returns
 */
export function Cartesian3ToLLH(cartesian: Cesium.Cartesian3): [number, number, number] {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)
  return [lon, lat, cartographic.height]
}

/**
 * 获得鼠标在屏幕上的经纬度与cartesian3
 * @param viewer
 * @param position
 * @returns
 */
export function getMousePosition(viewer: Cesium.Viewer, position: Cesium.Cartesian2) {
  const mouseCoordinate: MouseEvent = {
    lonlat: undefined,
    cartesian3: undefined,
    position: position
  }
  mouseCoordinate.cartesian3 = getPosition(viewer, position)
  if (mouseCoordinate.cartesian3) {
    mouseCoordinate.lonlat = Cartesian3ToLLH(mouseCoordinate.cartesian3)
  }
  return mouseCoordinate
}
/**
 * 拾取entity，判断当前拾取的坐标是否是entity
 */
export function pickEntity(viewer: Cesium.Viewer, position: Cesium.Cartesian2) {
  const primitive = viewer.scene.pick(position)
  if (!primitive) return
  const { id } = primitive
  return id._id
}

/**
 * 回到初始状态
 */
export function flyHome(viewer: Cesium.Viewer) {
  viewer?.camera.flyHome()
}
