import { isObject } from 'lodash-es'

/** 获取值的原始类型名称（如 Object、Array、String） */
export const getElType = (arg) => {
  return Object.prototype.toString.call(arg).slice(8, -1)
}

/** 在新窗口或指定 target 中打开 URL */
function openWindow(
  url: string,
  opt?: {
    target?: '_self' | '_blank' | string
    noopener?: boolean
    noreferrer?: boolean
  },
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature: string[] = []

  noopener && feature.push('noopener=yes')
  noreferrer && feature.push('noreferrer=yes')

  window.open(url, target, feature.join(','))
}

/** 将对象参数拼接到 URL 查询字符串 */
function appendUrlParams(baseUrl: string, obj: any): string {
  let parameters = ''
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&'
  }
  parameters = parameters.replace(/&$/, '')
  return /\?$/.test(baseUrl)
    ? baseUrl + parameters
    : baseUrl.replace(/\/?$/, '?') + parameters
}

/** 深度合并两个对象，target 覆盖 src 中的同名字段 */
function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] =
      isObject(src[key]) && src[key] !== null
        ? deepMerge(src[key], target[key])
        : (src[key] = target[key])
  }
  return src
}

/** 判断字符串是否为合法 URL */
function isUrl(path: string): boolean {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/
  return reg.test(path)
}

/** 获取 UI 组件（如 Popover）的挂载节点 */
function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body
}

/** 根据 value 从选项列表中获取对应的 label */
function getLabelByValue(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

/** 根据 code 从选项列表中获取对应的 label */
function getLabelByCode(options, value) {
  const option = options.find((item) => item.code === value)
  return option ? option.label : ''
}

/** 将点分隔的扁平 key 转换为嵌套对象结构 */
function formatConversion(target) {
  const output = {}
  for (const quantityKey in target) {
    const keySplits = quantityKey.split('.')
    let current = output
    let value = target[quantityKey]
    const lastKey = keySplits[keySplits.length - 1]
    const reg = /\[[a-zA-Z\d_]+\]/g
    for (let j = 0; j < keySplits.length; j++) {
      const key = keySplits[j]
      const isArray = reg.test(key)
      if (!current[key]) {
        current[key] = {}
      }
      if (key === lastKey) {
        if (Array.isArray(value)) {
          const [item] = value
          const itemType = getElType(item)
          if (['Array'].includes(itemType)) {
            value = value.map((el) => el[el.length - 1])
          }
        }
        !isArray && (current[lastKey] = value)
      }
      current = current[key]
    }
  }
  return output
}

/** 将查询字符串解析为键值对对象 */
const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  return result
}

export {
  isUrl,
  deepMerge,
  appendUrlParams,
  openWindow,
  getPopupContainer,
  formatConversion,
  parseQueryString,
  getLabelByValue,
  getLabelByCode,
}
