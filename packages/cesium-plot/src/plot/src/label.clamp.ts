import PolygonBase from '../base/polygon'

import type { GeoJsonFeaturesExtend, MouseEvent } from '../types'

export default class LabelClamp extends PolygonBase {
  /**
   * 图片材质
   */
  imgMaterial: string | undefined
  constructor(config: any) {
    super(config)
    this.properties = {
      style: {
        text: '贴地文字',
        fillStyle: '#ffffff',
        fontSize: 30,
        fontFamily: 'Arial',
        outline: false,
        outlineWidth: 1,
        outlineColor: '#000000'
      }
    }
    this.prompt.setText('单击确定文字起点位置')
  }
  onClick(event: MouseEvent): void {
    const { lonlat } = event
    if (!lonlat) return
    if (this.vertexs.length === 0) {
      this.addVertex(lonlat)
      this.prompt.setText('移动鼠标然后选中文字的结束点位置')
      this.createImageMaterial(this.properties.style)
      this.createPrimitve()
    } else if (this.vertexs.length >= 2) {
      this.updateVertex(this.currentVertexIdx + 1, lonlat)
      this.events.changeMode('LabelClamp', this)
    }
  }
  onMouseMove(event: MouseEvent): void {
    const { lonlat, position } = event
    if (!lonlat) {
      return this.prompt.closePrompt()
    }
    this.prompt.showPrompt()
    this.prompt.movePrompt(position)
    if (this.vertexs.length === 0) return
    this.updateVertex(this.currentVertexIdx + 1, lonlat)
  }
  updateCoordinates(idx: number, vertex: [number, number, number]): void {
    if (this.vertexs.length === 2) {
      this.setCoordinates(this.computedRect(this.vertexs[0], this.vertexs[1]))
    }
  }
  setCoordinates(vertexs: any): void {
    if (Array.isArray(vertexs) && vertexs.length === 2) {
      this.setCoordinates(this.computedRect(vertexs[0], vertexs[1]))
    } else {
      this.coordinates = Cesium.Cartesian3.fromDegreesArrayHeights(vertexs.flat())
    }
  }
  /**
   * 根据对角两点计算矩阵四个点位
   * @param startPoint
   * @param endPoint
   * @returns
   */
  computedRect(startPoint: [number, number, number], endPoint: [number, number, number]) {
    // 西北、东北、东南、西南
    const westNorth = startPoint
    const eastNorth = [endPoint[0], startPoint[1], 0]
    const eastWest = endPoint
    const westSouth = [startPoint[0], endPoint[1], 0]
    return [westNorth, eastNorth, eastWest, westSouth]
  }
  getStyle(): { [key: string]: any } {
    return this.properties.style
  }
  setStyle(params: { [key: string]: any }): void {
    if (!this.entity) return
    this.properties.style = Object.assign(this.properties.style, params)
    this.createImageMaterial(this.properties.style)
    this.entity.polygon!.material = new Cesium.ImageMaterialProperty({
      image: Cesium.buildModuleUrl(this.imgMaterial || ''),
      transparent: true
    })
  }
  createPrimitve(params?: any): void {
    this.entity = this.viewer.entities.add({
      id: this.id,
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(this.getCoordinates())
        }, false),
        material: new Cesium.ImageMaterialProperty({
          image: Cesium.buildModuleUrl(this.imgMaterial || ''),
          transparent: true
        })
      }
    })
  }
  /**
   * 创建图片材质
   * @param style
   * @returns
   */
  createImageMaterial(style: any) {
    const {
      fillStyle = '#ffffff',
      fontSize = 30,
      fontFamily = 'Arial',
      text = '贴地文字',
      outlineColor,
      outline,
      outlineWidth
    } = style
    // 创建一个canvas元素并获取2D渲染上下文
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // 设置canvas尺寸
    canvas.width = 200 // 图片宽度
    canvas.height = 70 // 图片高度
    draw()
    /**
     * 绘制内容
     * @returns
     */
    function draw() {
      if (!ctx) return
      // 设置字体样式
      ctx.font = fontSize + 'px ' + fontFamily
      ctx.textAlign = 'center' // 文本对齐方式
      ctx.textBaseline = 'middle' // 基线对齐方式
      // 设置填充颜色
      ctx.fillStyle = fillStyle
      var x = canvas.width / 2 // 计算文本中心位置
      var y = canvas.height / 2
      const textWidth = ctx.measureText(text).width
      if (textWidth < canvas.width) {
        // 设置边框
        if (outline) {
          ctx.stroke()
          ctx.lineWidth = outlineWidth
          ctx.strokeStyle = outlineColor
          ctx.strokeText(text, x, y)
        }
        // 绘制文本
        ctx.fillText(text, x, y)
      } else {
        // 根据字体宽度自动调节文本换行
        const words = text.split('')
        const lineHeight = fontSize
        let lineNumber = 1
        let line = ''
        for (let n = 0; n < words.length; n++) {
          // if (canvas.height <= lineHeight * lineNumber) {
          //   resetHeight(lineHeight * lineNumber)
          //   break
          // }
          const testLine = line + words[n] // 构建一行文本
          const metrics = ctx.measureText(testLine)
          // 如果这一行加上新词的宽度超过最大宽度，则换行
          if (metrics.width >= canvas.width) {
            ctx.fillText(line, x, lineHeight * lineNumber++) // 绘制当前行
            line = words[n] // 新行从当前词开始
          } else {
            line = testLine
          }
        }
        // 绘制最后一行
        if (line) {
          ctx.fillText(line, 0, lineHeight * lineNumber)
        }
      }
    }
    function resetHeight(height: number) {
      canvas.height = height
      draw()
    }
    // 将canvas内容转换为Image对象或Data URL
    this.imgMaterial = canvas.toDataURL('image/png') // 转换为PNG格式数据URL
  }

  createFromGeoJSON(json: GeoJsonFeaturesExtend) {
    const { geometry, properties, id } = json
    this.id = id
    this.setVertexs(geometry.coordinates.flat())
    this.createImageMaterial(properties.style)
    this.createPrimitve()
    this.stores.addFeature(this)
    this.properties = properties
  }
  isValidGeoJSON(): boolean {
    if (this.vertexs.length < 2) return false
    if (this.vertexs.length === 2) {
      const p1 = Cesium.Cartesian3.fromDegrees(...this.vertexs[0])
      const p2 = Cesium.Cartesian3.fromDegrees(...this.vertexs[1])
      let distance = Cesium.Cartesian3.distance(p1, p2)
      return !!distance
    }
    return true
  }
  toGeoJSON() {
    return {
      id: this.id,
      featureConstructorName: this.constructor.name,
      type: 'Feature',
      properties: { style: { ...this.getStyle() }, ...this.properties },
      geometry: {
        coordinates: [this.vertexs],
        type: this.geometryType
      }
    } as GeoJsonFeaturesExtend
  }
}
