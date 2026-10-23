
import type { FeatureBase } from '../base'
import type { GeoJson } from '../types'
/**
 * 存储数据要符合geojson通用格式
 * 做持久化处理，只要数据存储在里面，就一定要渲染，如果数据不在了，就一定要清理
 */
class GeoJsonStore {
  viewer: Cesium.Viewer
  features: Map<string, FeatureBase>
  constructor(config: any) {
    const { viewer, features } = config
    this.viewer = viewer
    this.features = features || new Map([])
  }
  addFeature<T extends FeatureBase>(feature: T) {
    this.features.set(feature.id, feature)
  }
  getFeature(id: string) {
    return this.features.get(id)
  }
  deleteFeature(id: string) {
    this.features.delete(id)
  }
  deleteFeatures(ids: string[]) {
    ids.forEach((item) => {
      this.features.delete(item)
    })
  }
  deleteFeatureAll() {
    this.features.forEach((item) => {
      item.remove()
    })
    this.features.clear()
  }
  toGeoJSON() {
    // TODO:处理脏数据
    const json: GeoJson = {
      type: 'FeatureCollection',
      features: []
    }
    this.features.forEach((item) => {
      if (item.isValidGeoJSON()) {
        json.features.push(item.toGeoJSON())
      }
    })
    return json
  }
}
export default GeoJsonStore
