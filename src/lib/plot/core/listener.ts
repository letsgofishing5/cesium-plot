export default class Listener {
  /**
   * 事件列表
   */
  eventMap: Map<string, ((param?: any) => void)[]>
  constructor() {
    this.eventMap = new Map([])
  }
  // 发布
  emit(name: any, param?: any) {
    if (this.eventMap.has(name)) {
      this.eventMap.get(name)?.forEach((item) => {
        item(param)
      })
    }
  }
  // 订阅
  on(name: string, cb: any) {
    if (!this.eventMap.has(name)) {
      return this.eventMap.set(name, [cb])
    }
    this.eventMap.get(name)?.push(cb)
  }
  // 取消订阅
  un(name: string) {
    if (this.eventMap.has(name)) {
      this.eventMap.delete(name)
    }
  }
}
