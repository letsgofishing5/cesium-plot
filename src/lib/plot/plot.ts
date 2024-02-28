import CesiumEvents from './core/event'
import Listener from './core/listener'
import GeoJsonStore from './core/store'

import { Prompt } from './prompt/prompt'
import Select from './src/select'
import type { GeoJson, GeoJsonFeaturesExtend } from './types'
import * as PlotCollection from './src'
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
  featureCollection: any
  mode: any
  prompt: Prompt
  constructor(config: any) {
    const { viewer } = config
    this.viewer = viewer
    this.featureCollection = PlotCollection
    this.mode = null
    this.prompt = new Prompt()
    this.listener = new Listener() //初始化订阅发布
    this.stores = new GeoJsonStore(config) //初始化数据管理
    this.events = new CesiumEvents({
      viewer,
      mode: null,
      featureCollection: this.featureCollection
    }) //初始化事件管理
  }

  /**
   * 改变绘制模式
   * @date 2/21/2024 - 4:14:23 PM
   * @author 走我们钓鱼去
   *
   * @param {?*} [mode]
   * @param {boolean} [isContinue=true] 默认为true，连续绘制，设置为false则为单次绘制
   */
  changeMode(mode?: any, isContinue = true) {
    this.events.changeMode(mode || Select, Object.assign(this, { isContinue }))
  }
  /**
   * 事件监听
   * @param name
   * @param cb
   */
  on(name: string, cb: any) {
    this.listener.on(name, cb)
  }
  /**
   * 事件卸载
   * @param name
   */
  un(name: string) {
    this.listener.un(name)
  }
  /**
   * 数据导出
   * @returns
   */
  export() {
    return this.stores.toGeoJSON()
  }
  /**
   * 导入数据
   */
  load(geojson: GeoJson) {
    const { type, features } = geojson
    // 判断导入的数据格式是否正确
    if (type !== 'FeatureCollection' || !Array.isArray(features)) {
      throw new Error('导入数据格式不正确')
    }
    // 生成features
    ; (features as GeoJsonFeaturesExtend[]).forEach((item: GeoJsonFeaturesExtend) => {
      const Feature = this.featureCollection[item.featureConstructorName]
      const feature = new Feature(this)
      feature.createFromGeoJSON(item)
    })
  }
  removeAll() {
    this.stores.deleteFeatureAll()
  }
  updateEntityStyle(id: string, params: any) {
    const feature = this.stores.getFeature(id)
    if (!feature) return
    feature.setStyle(params)
  }
}
