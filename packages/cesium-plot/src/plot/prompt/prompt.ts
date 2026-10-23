import './prompt.css'
import type { ElementConfit } from './types'
export class Prompt {
  prompt: HTMLElement
  rightMenu: HTMLElement
  menuMap: Map<string, Function>
  callbackMap: Map<string, (param?: any) => void>
  fn: () => void
  constructor() {
    this.rightMenu = this.createRightMenu()
    this.prompt = this.createPrompt()
    this.fn = () => { }
    this.menuMap = new Map([['delete', this.createDeleteEl.bind(this)]])
    this.callbackMap = new Map([['delete', () => { }]])
  }
  /**
   * 创建提示词元素
   * @returns
   */
  createPrompt() {
    const dom = this.createElement('div', {
      className: '__lsgfish_prompt',
      style: { display: 'none' }
    })
    dom.innerHTML = '我是提示框'
    document.body.appendChild(dom)
    return dom
  }
  close() {
    this.closePrompt()
    this.closeRightMenu()
  }
  setText(text: string) {
    this.prompt.innerText = text
  }
  showPrompt() {
    if (this.prompt.style.display === 'block') return
    this.prompt?.style.setProperty('display', 'block')
  }
  closePrompt() {
    this.prompt.style.setProperty('display', 'none')
  }
  movePrompt(position: { x: number; y: number }) {
    let { x, y } = position
    x += 3
    y += 30
    const { width, height } = this.prompt.getBoundingClientRect()
    x += width / 5
    y -= height / 2
    this.prompt?.style.setProperty('left', x + 'px')
    this.prompt?.style.setProperty('top', y + 'px')
  }
  showRightMenu(el: Array<[string, () => void]>) {
    // 让菜单显示
    this.rightMenu.style.setProperty('display', 'block')
    // 清空内部元素
    while (this.rightMenu.lastElementChild) {
      this.rightMenu.lastElementChild.remove()
    }
    // 根据参数中配置的数据，重新添加子元素
    el.forEach((item) => {
      if (this.menuMap.has(item[0])) {
        // 取消事件注册
        if (this.callbackMap.has(item[0])) {
          const callback = this.callbackMap.get(item[0])
          removeEventListener('click', callback!)
        }
        this.callbackMap.set(item[0], item[1])
        const dom = this.menuMap.get(item[0])?.()
        this.rightMenu.appendChild(dom)
      }
    })
  }
  closeRightMenu() {
    this.rightMenu.style.setProperty('display', 'none')
  }
  moveRightMenu(position: { x: number; y: number }) {
    // 获取坐标位置
    let { x, y } = position
    x += 6
    y += 40
    this.rightMenu?.style.setProperty('left', x + 'px')
    this.rightMenu?.style.setProperty('top', y + 'px')
  }
  /**
   * 创建右键菜单元素
   */
  createRightMenu() {
    const dom = this.createElement('div', {
      className: '__lsgfish_menu',
      style: { display: 'none' }
    })
    document.body.appendChild(dom)
    return dom
  }
  /**
   * 创建删除元素
   */
  createDeleteEl() {
    const dom = this.createElement('div', { className: 'delete' })
    dom.innerHTML = `
    <svg t="1707287068207" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="4256" width="30" height="30">
        <path
            d="M733.696 791.552c0 26.624-21.504 48.128-48.128 48.128H338.432c-26.624 0-48.128-21.504-48.128-48.128V280.064h443.904v511.488zM386.56 193.536c0-5.632 4.096-9.728 9.728-9.728h231.936c5.632 0 9.728 4.096 9.728 9.728v29.184H386.56v-29.184z m492.032 29.184h-182.784v-29.184c0-36.864-30.208-67.584-67.584-67.584H396.288c-36.864 0-67.584 30.208-67.584 67.584v29.184H145.408c-15.872 0-29.184 12.8-29.184 29.184 0 15.872 12.8 29.184 29.184 29.184h86.528v510.976c0 58.88 47.616 106.496 106.496 106.496h347.136c58.88 0 106.496-47.616 106.496-106.496v-512h86.528c15.872 0 29.184-12.8 29.184-29.184s-13.312-28.16-29.184-28.16zM512 752.64c15.872 0 29.184-12.8 29.184-29.184V414.72c0-15.872-12.8-29.184-29.184-29.184s-29.184 12.8-29.184 29.184v308.736c0 16.384 13.312 29.184 29.184 29.184m-135.168 0c15.872 0 29.184-12.8 29.184-29.184V414.72c0-15.872-12.8-29.184-29.184-29.184-15.872 0-29.184 12.8-29.184 29.184v308.736c0.512 16.384 13.312 29.184 29.184 29.184m270.336 0c15.872 0 29.184-12.8 29.184-29.184V414.72c0-15.872-12.8-29.184-29.184-29.184s-29.184 12.8-29.184 29.184v308.736c0.512 16.384 13.312 29.184 29.184 29.184"
            p-id="4257"></path>
    </svg>
    `
    if (this.callbackMap.has('delete')) {
      dom.onclick = this.callbackMap.get('delete')!
    }
    return dom
  }
  /**
   * 创建dom元素
   * @param selector
   * @param config
   * @returns
   */
  createElement(selector: string, config: Partial<ElementConfit>) {
    const dom = document.createElement(selector)
    dom.classList.add(config.className || '')
    dom.id = config.id
    for (const key in config.style) {
      dom.style.setProperty(key, config.style[key])
    }
    return dom
  }
}
