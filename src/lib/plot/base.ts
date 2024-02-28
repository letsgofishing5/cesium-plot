
import CesiumEvents from './core/event'
import GeoJsonStore from './core/store'
import { UUID } from '../utils'
import { Prompt } from './prompt/prompt'
import type Listener from './core/listener'
import type { Point } from './src'
import type { GeoJsonFeaturesExtend, GeoJsonGeometryType, MouseEvent } from './types'
/**
 * 基类
 */
export class FeatureBase {
  /**
   * 实例id
   */
  id: string
  /**
   * 当前entity
   */
  entity: Cesium.Entity | undefined
  /**
   * cesium中的viewer实例
   */
  viewer: Cesium.Viewer
  /**
   * 事件订阅发布
   */
  listener: Listener
  /**
   * 几何类型，导出geojson时使用，在构造函数中赋值即可
   */
  geometryType?: GeoJsonGeometryType
  /**
   * 用户选中的点集合，经纬度、高度
   */
  vertexs: Array<[number, number, number]>
  /**
   * 渲染的经纬度（在每次vertexs更新后，都需要重新计算一下插值）
   */
  coordinates: any
  /**
   * 当前控制点集合的下标，this.vertex.length - 1
   */
  currentVertexIdx: number
  /**
   * 属性
   */
  properties: { [key: string]: any }
  /**
   * 事件管理实例
   */
  events: CesiumEvents
  /**
   * 数据仓实例
   */
  stores: GeoJsonStore
  /**
   * 信息提示框
   */
  prompt: Prompt
  /**
   * 屏幕时间管理器
   */
  screenEventHandler: Cesium.ScreenSpaceEventHandler
  /**
   * 当前对象的点位控制对象集合
   */
  pointFeatures: Map<string, [number, Point]>
  /**
   * 当前时间戳，主要用来给双击事件时，对单击事件做节流优化使用
   */
  currentTimeStamp: number

  /**
   * 当前动作结束后的绘制模式
   * @date 2/21/2024 - 4:16:10 PM
   * @author 走我们钓鱼去
   *
   * @type {*}
   */
  mode: any
  /**
   * 是否连续绘制
   * @date 2/28/2024 - 2:45:26 PM
   * @author 走我们钓鱼去
   *
   * @type {?boolean}
   */
  isContinue?: boolean
  constructor(config: any) {
    const { viewer, listener, events, stores, prompt, isContinue } = config
    this.viewer = viewer
    this.listener = listener
    this.events = events //初始化事件
    this.stores = stores //初始化数据管理
    this.properties = {} //数据解析
    this.currentVertexIdx = 0
    this.coordinates = []
    this.vertexs = [] //点位
    this.id = UUID() //随机函数随机一个id出来
    this.prompt = prompt
    this.entity = new Cesium.Entity()
    this.screenEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.pointFeatures = new Map([])
    this.currentTimeStamp = new Date().getTime()
    this.isContinue = isContinue
    this.mode = isContinue ? this.constructor.name : 'Select'
  }
  /**
   * 模式启用时会调用
   */
  start() {
    this.stores.addFeature(this)
    this.currentVertexIdx = 0
      ; (this.viewer.container as HTMLElement).style.cursor = 'crosshair'
  }
  /**
   * 当前模式调用结束前调用
   */
  stop() {
    this.currentVertexIdx = 0
      ; (this.viewer.container as HTMLElement).style.cursor = 'default'
  }
  /**
   * 当前操作结束的调用hans
   */
  finish() {
    this.events.changeMode(this.mode, this)
    this.prompt.closePrompt()
  }

  /**
   * 鼠标左键弹起
   */
  mouseLeftBounceUp(): void { }
  /**
   * 移动当前的元素回调
   * @param cartesian
   */
  move(cartesian: Cesium.Cartesian2, id?: string) { }
  /**
   * 选中当前元素的回调
   */
  selected(params?: any): any { }
  /**
   * 取消选中回调
   */
  unSelected(params?: any) { }
  /**
   * 创建图元、entity
   * @param params
   */
  createPrimitve(params?: any) { }
  remove(params?: any): void {
    this.viewer.entities.removeById(this.id)
    this.pointFeatures.forEach((item) => {
      this.viewer.entities.removeById(item[1].id)
    })
  }
  /**
   * 校验当前feature的json数据是否合格，合格返回true，不合格返回false，各种类型需要自己实现具体逻辑
   * @returns
   */
  isValidGeoJSON(): boolean {
    return this.vertexs.length > 0
  }
  /**
   * 添加控制点，根据下标添加控制点
   * @param idx
   * @param vertex
   * @returns
   */
  addVertex(vertex: [number, number, number]) {
    this.vertexs.push(vertex)
    this.currentVertexIdx = this.vertexs.length - 1
    this.addCoordinates(vertex)
  }
  /**
   * 插入经纬度
   * @param idx
   * @param vertex
   */
  insertVertex(idx: number, vertex: [number, number, number]) {
    this.vertexs.splice(idx, 0, vertex)
    this.insertCoordinates(idx, vertex)
  }
  /**
   * 更新控制点
   * @param idx
   * @param vertex
   */
  updateVertex(idx: number, vertex: [number, number, number]) {
    this.vertexs.splice(idx, 1, vertex)
    this.updateCoordinates(idx, vertex)
  }
  /**
   * 移出控制点
   * @param idx
   * @returns
   */
  removeVertex(idx: number) {
    if (idx < 0 || idx >= this.vertexs.length) return
    this.vertexs.splice(idx, 1)
    this.currentVertexIdx = this.vertexs.length - 1
    this.removeCoordinates(idx)
  }

  /**
   * 设置控制点，一次性更新所有的vertex
   * @param vertexs
   */
  setVertexs(vertexs: any[]) {
    this.vertexs = vertexs
    this.currentVertexIdx = this.vertexs.length - 1
    this.setCoordinates(vertexs)
  }

  /**
   * 获取控制点
   * @returns
   */
  getVertexs(): any {
    return this.vertexs
  }

  /**
   * 获取计算的控制点位数据
   * @returns
   */
  getCoordinates() {
    return this.coordinates
  }
  /**
   * 插入渲染经纬度
   * @param idx
   * @param vertex
   */
  insertCoordinates(idx: number, vertex: [number, number, number]) {
    this.coordinates.splice(idx, 0, Cesium.Cartesian3.fromDegrees(...vertex))
  }
  /**
   * 添加渲染经纬度
   * @param vertex
   */
  addCoordinates(vertex: [number, number, number]) {
    this.coordinates.push(Cesium.Cartesian3.fromDegrees(...vertex))
  }
  /**
   * 计算控制点插值数据
   * @param coordinates
   */
  setCoordinates(vertexs: any) {
    this.coordinates = Cesium.Cartesian3.fromDegreesArrayHeights(vertexs.flat())
  }
  /**
   * 删除渲染经纬度
   * @param idx
   * @param vertex
   */
  removeCoordinates(idx: number) {
    this.coordinates.splice(idx, 1)
  }
  /**
   * 更新渲染经纬度
   * @param idx
   * @param vertex
   */
  updateCoordinates(idx: number, vertex: [number, number, number]) {
    this.coordinates.splice(idx, 1, Cesium.Cartesian3.fromDegrees(...vertex))
  }
  /**
   * 获取样式
   */
  getStyle(): { [key: string]: any } {
    // TODO:待完成
    return {}
  }
  /**
   * 设置样式
   * @param params
   */
  setStyle(params: { [key: string]: any }) { }
  /**
   * 设置属性
   * @param key
   * @param value
   */
  setProperty(key: string, value: any) {
    this.properties[key] = value
  }

  /**
   * 获取属性
   * @param key
   * @returns
   */
  getProperty(key: string) {
    return this.properties[key]
  }
  onClick(event: MouseEvent) { }
  onLeftDown(event: MouseEvent) { }
  onLeftUp(event: MouseEvent) { }
  onDbClick(event: MouseEvent) { }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.movePrompt(position)
  }
  onRightClick(event: MouseEvent) { }
  onMouseDown(event: MouseEvent) { }
  onMouseUp(event: MouseEvent) { }
  onWheel(event: number) { }
  /**
   * 通过json数据格式进行创建
   * @param json
   */
  createFromGeoJSON(json: GeoJsonFeaturesExtend) {
    const { geometry, properties, id } = json
    this.id = id
    this.setVertexs(geometry.coordinates)
    this.createPrimitve()
    this.stores.addFeature(this)
    this.properties = properties
  }
  /**
   * 导出geojson数据
   * @returns
   */
  toGeoJSON(): GeoJsonFeaturesExtend {
    return {
      id: this.id,
      featureConstructorName: this.constructor.name,
      type: 'Feature',
      properties: { style: { ...this.getStyle() }, ...this.properties },
      geometry: {
        coordinates: this.getVertexs(),
        type: this.geometryType
      }
    } as any
  }
}
