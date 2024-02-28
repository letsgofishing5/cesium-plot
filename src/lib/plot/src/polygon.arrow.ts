import PolygonBase from '../base/polygon'

import { getMousePosition } from '@/lib/utils'
import type { MouseEvent } from '../types'
export default class PolygonArrow extends PolygonBase {
  clickTimes: number
  constructor(config: any) {
    super(config)
    this.clickTimes = 0
    this.prompt.setText('单击选择箭头开始位置')
  }
  onClick(event: MouseEvent): void {
    const now = new Date().getTime()
    if (now - this.currentTimeStamp < 300) return
    this.currentTimeStamp = now
    const { lonlat, position } = event
    if (!lonlat) return
    if (this.clickTimes === 0) {
      this.clickTimes++
      this.addVertex(lonlat)
      this.prompt.setText('移动鼠标，然后单击选择箭头结束位置，右击回撤')
      this.createPrimitve()
    } else {
      this.finish()
      if (!this.entity?.polyline) return
      this.entity.polyline!.show = false as any
    }
  }

  /**
   * 计算箭头需要的渲染坐标
   */
  computedArrowPoints() {
    // 计算箭头的两侧尖端坐标
    // 计算箭头的颈部两个坐标
    // 计算箭头屁股的两个坐标
    const start = Cesium.Cartesian3.fromDegrees(...this.vertexs[0])
    const end = Cesium.Cartesian3.fromDegrees(...this.vertexs[1])
    // // 计算线段的向量
    // var lineVector = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3())
    // // 计算线段向量的长度（即线段长度）
    // var vectorLength = Cesium.Cartesian3.magnitude(lineVector)
    // const tailWidth = vectorLength / 5
    // const headWidth = vectorLength / 4
    // const nectWidth = vectorLength / 8
    // const headLength = vectorLength / 4
    // const nectLength = vectorLength / 5
    // const headRight = this.computedThirdPoint(start, end, -headLength, -headWidth)
    // const neckRight = this.computedThirdPoint(start, end, -nectLength, -nectWidth)
    // const nectLeft = this.computedThirdPoint(start, end, -nectLength, nectWidth)
    // const headLeft = this.computedThirdPoint(start, end, -headLength, headWidth)
    // const tailLeft = this.computedThirdPoint(start, end, -vectorLength, tailWidth)
    // const tailRight = this.computedThirdPoint(start, end, -vectorLength, -tailWidth)
    // this.setCoordinates([headLeft, end, headRight, neckRight, tailRight, tailLeft, nectLeft])
    const cartesianLeftH = this.computedThirdPoint2(4, Math.PI / 7)
    const cartesianleftN = this.computedThirdPoint2(3, Math.PI / 10)
    const cartesianRightH = this.computedThirdPoint2(4, Math.PI / 7, false)
    const cartesianRightN = this.computedThirdPoint2(3, Math.PI / 10, false)
    const coordinates = [
      cartesianLeftH,
      cartesianleftN,
      start,
      cartesianRightN,
      cartesianRightH,
      end
    ]
    this.setCoordinates(coordinates)
  }

  /**
   *计算箭头的第三个位置的点cartesian3坐标（使用了Cesium.Cartesian3的计算函数）
   * @param start 坐标起点
   * @param end 坐标终点
   * @param length 距离坐标终点的长度
   * @param width 距离线段的垂直距离
   */
  computedThirdPoint(
    start: Cesium.Cartesian3,
    end: Cesium.Cartesian3,
    length: number,
    width: number
  ) {
    // 计算线段的向量
    var lineVector = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3())
    // 计算线段的长度比例
    const lineRatio = length / Cesium.Cartesian3.magnitude(lineVector)
    // 计算出垂直点的cartesian3坐标
    let verticalPoint = Cesium.Cartesian3.multiplyByScalar(
      lineVector,
      lineRatio,
      new Cesium.Cartesian3()
    )
    // 将垂直点与终点进行相加
    verticalPoint = Cesium.Cartesian3.add(end, verticalPoint, verticalPoint)
    // 假设Z轴正方向是垂直于屏幕的向外方向，如果不是，请根据实际场景调整
    var normalDirection = Cesium.Cartesian3.UNIT_X // 垂直于XY平面的一个向量
    var perpendicularUnitVec = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(normalDirection, lineVector, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    )
    // 因此将这个长度乘以垂直向量得到点相对垂直点的位置偏移
    var verticalOffset = Cesium.Cartesian3.multiplyByScalar(
      perpendicularUnitVec,
      width,
      new Cesium.Cartesian3()
    )
    // 最后计算点坐标
    return Cesium.Cartesian3.add(verticalPoint, verticalOffset, new Cesium.Cartesian3())
  }
  /**
   * 计算相对于起始点的第三个坐标点位置（使用了三角函数计算公式）
   * @param length 相对于终点到起点的距离长度
   * @param radian 相对起始点的弧度
   * @param isLeft 是否在线的左边
   * @returns
   */
  computedThirdPoint2(length: number, radian: number, isLeft: boolean = true): Cesium.Cartesian3 {
    const startPoint = this.vertexs[0]
    const endPoint = this.vertexs[1]
    // 先求出线长度 AB
    // 先求出长度
    const len = this.getBaseLength(startPoint, endPoint)
    // 余弦值
    let aSin = Math.abs(endPoint[1] - startPoint[1]) / len
    // 弧度
    let aSinRadian = Math.asin(aSin)
    radian = isLeft ? radian : -radian
    // TODO:要弄懂这个拼接计算原理
    if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
      radian += aSinRadian + Math.PI
    } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
      radian += Math.PI * 2 - aSinRadian
    } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
      radian += aSinRadian
    } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
      radian += Math.PI - aSinRadian
    }
    // 根据求出来的弧度，还有斜边长度width=2,计算出邻边与对边的长度，
    const x = Math.cos(radian) * length
    const y = Math.sin(radian) * length
    // 计算出垂直点的坐标位置
    const verticalX2 = endPoint[0] + x
    const verticalY2 = endPoint[1] + y
    return Cesium.Cartesian3.fromDegrees(verticalX2, verticalY2, 0)
  }
  /**
   * 获取起始线段长度
   * @param startPoint
   * @param endPoint
   * @returns
   */
  getBaseLength(startPoint: number[], endPoint: number[]) {
    return Math.sqrt(
      Math.pow(endPoint[0] - startPoint[0], 2) + Math.pow(endPoint[1] - startPoint[1], 2)
    )
  }
  move(cartesian: Cesium.Cartesian2, id?: string | undefined): void {
    // 转换移动过程中的坐标经纬度
    const { lonlat } = getMousePosition(this.viewer, cartesian)
    // 如果传递了下标，则代表当前的移动操作是操作某个点的
    if (typeof id !== 'undefined' && this.id !== id && lonlat) {
      this.preControlPointPosition = undefined
      const point = this.pointFeatures.get(id)
      if (!point) return
      // 更新点
      this.updateVertex(point[0], lonlat)
      point[1]?.setVertexs(lonlat)
      this.computedArrowPoints()
      return
    }
    if (!this.preControlPointPosition) {
      this.preControlPointPosition = lonlat
    }
    // 否则就是操作整个线条
    if (this.preControlPointPosition && this.preControlPointPosition.length && lonlat) {
      const lon = lonlat[0] - this.preControlPointPosition[0]
      const lat = lonlat[1] - this.preControlPointPosition[1]
      this.vertexs.forEach((item) => {
        item[0] += lon
        item[1] += lat
      })
      this.computedArrowPoints()
    }
    if (lonlat) {
      this.preControlPointPosition = lonlat
    }
  }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.movePrompt(position)
    this.updateVertex(this.currentVertexIdx, lonlat)
    if (this.vertexs.length >= 2) this.computedArrowPoints()
  }
  setCoordinates(coordinates: any): void {
    this.coordinates = coordinates
  }
  getPolylineCoordinates() {
    if (this.vertexs.length < 2) return [new Cesium.Cartesian3(), new Cesium.Cartesian3()]
    return Cesium.Cartesian3.fromDegreesArrayHeights([...this.vertexs[0], ...this.vertexs[1]])
  }
  finish(): void {
    this.clickTimes = 0
    this.events.changeMode(PolygonArrow, this)
  }
  createPrimitve(params?: any): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
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
