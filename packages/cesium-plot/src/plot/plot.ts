import * as Cesium from 'cesium'
import CesiumEvents from './core/event'
import Listener from './core/listener'
import GeoJsonStore from './core/store'

import { Prompt } from './prompt/prompt'
import type { FeatureBase } from './base'
import type {
  AnyFeatureStyle,
  GeoJson,
  PlotEventMap,
  PlotMode
} from './types'
import * as PlotCollection from './src'

/**
 * Plot 初始化配置
 */
export interface PlotOptions {
  /** cesium 的 viewer 实例 */
  viewer: Cesium.Viewer
}

export default class Plot {
  /**
   * cesium中的viewer实例
   */
  viewer: Cesium.Viewer
  /**
   * 事件管理实例
   */
  events: CesiumEvents
  /**
   * 事件订阅发布
   */
  listener: Listener
  /**
   * 数据仓实例
   */
  stores: GeoJsonStore
  /**
   * 可用的图元类型集合
   */
  featureCollection: typeof PlotCollection
  /**
   * 当前绘制模式实例
   */
  mode: FeatureBase | null
  /**
   * 信息提示框
   */
  prompt: Prompt
  /**
   * 是否连续绘制
   */
  isContinue: boolean
  constructor(options: PlotOptions) {
    const { viewer } = options
    this.viewer = viewer
    this.featureCollection = PlotCollection
    this.mode = null
    this.isContinue = true
    this.prompt = new Prompt()
    this.listener = new Listener() //初始化订阅发布
    this.stores = new GeoJsonStore(options) //初始化数据管理
    this.events = new CesiumEvents({
      viewer,
      mode: null,
      featureCollection: this.featureCollection
    }) //初始化事件管理
  }

  /**
   * 改变绘制模式
   * @param mode 绘制模式，不传默认为 Select
   * @param isContinue 是否连续绘制，默认为 true
   */
  changeMode(mode: PlotMode = 'Select', isContinue = true) {
    this.isContinue = isContinue
    this.events.changeMode(mode, this)
  }
  /**
   * 事件监听
   * @param name 事件名
   * @param cb 回调
   */
  on<K extends keyof PlotEventMap>(name: K, cb: (payload: PlotEventMap[K]) => void) {
    this.listener.on(name, cb)
  }
  /**
   * 事件卸载
   * @param name 事件名
   */
  un(name: keyof PlotEventMap) {
    this.listener.un(name)
  }
  /**
   * 数据导出
   * @returns GeoJSON FeatureCollection
   */
  export(): GeoJson {
    return this.stores.toGeoJSON()
  }
  /**
   * 导入数据
   * @param geojson 符合 GeoJSON 规范的数据
   */
  load(geojson: GeoJson) {
    const { type, features } = geojson
    // 判断导入的数据格式是否正确
    if (type !== 'FeatureCollection' || !Array.isArray(features)) {
      throw new Error('导入数据格式不正确')
    }
    features.forEach((item) => {
      const Feature = this.featureCollection[item.featureConstructorName]
      if (!Feature) {
        console.warn(`没有找到${item.featureConstructorName}对应的图元类型`)
        return
      }
      const feature = new Feature(this)
      feature.createFromGeoJSON(item)
    })
  }
  /**
   * 清空所有图元
   */
  removeAll() {
    this.stores.deleteFeatureAll()
  }
  /**
   * 更新指定图元的样式
   * @param id 图元id
   * @param style 样式
   */
  updateEntityStyle(id: string, style: AnyFeatureStyle) {
    const feature = this.stores.getFeature(id)
    if (!feature) return
    feature.setStyle(style)
  }
}
