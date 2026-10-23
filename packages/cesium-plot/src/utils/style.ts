/**
 * 注入样式，同名样式只注入一次
 * @param css 样式内容
 * @param id 样式标签 id
 */
export function injectStyle(css: string, id = 'cesium-plot-style') {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = css
  document.head.appendChild(style)
}
