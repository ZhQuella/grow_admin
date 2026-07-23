/** 运行时 props 兼容（对齐设计器 eleModuleComponent / basicComponent） */

const TEXT_CONTENT_TAGS = new Set(['GrowButton', 'GrowLink', 'GrowEllipsis'])
const BASIC_TEXT_TAGS = new Set(['p', 'span', 'div', 'BasicTitle'])

export function normalizeBasicProps(
  tag: string,
  raw: Record<string, any> | undefined,
): Record<string, any> {
  const info = { ...(raw || {}) }
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')
  if (tag === 'BasicTitle' || ['p', 'span', 'div'].includes(tag)) {
    Reflect.deleteProperty(info, 'level')
    Reflect.deleteProperty(info, 'context')
  }
  if (TEXT_CONTENT_TAGS.has(tag)) {
    Reflect.deleteProperty(info, 'content')
  }
  return info
}

export function resolveBasicTag(
  tag: string | undefined,
  propsInfo: Record<string, any> | undefined,
): string | null {
  if (!tag) return null
  if (tag === 'BasicTitle') {
    const raw = String(propsInfo?.level || 'h3').toLowerCase()
    return /^h[1-6]$/.test(raw) ? raw : 'h3'
  }
  return tag
}

export function resolveBasicText(
  tag: string | undefined,
  propsInfo: Record<string, any> | undefined,
): string | undefined {
  if (!tag) return undefined
  if (tag === 'BasicTitle' || tag === 'p' || tag === 'span') {
    return propsInfo?.context ?? ''
  }
  return undefined
}

export function normalizeModuleProps(
  tag: string,
  raw: Record<string, any> | undefined,
): Record<string, any> {
  const info = { ...(raw || {}) }

  // 设计器控制字段，不透传给底层组件
  Reflect.deleteProperty(info, 'model')
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')

  if (tag === 'GrowColumnBar') {
    Reflect.deleteProperty(info, 'columnsSource')
    Reflect.deleteProperty(info, 'tableUuid')
  }

  if (TEXT_CONTENT_TAGS.has(tag)) {
    Reflect.deleteProperty(info, 'content')
  }

  if (tag === 'GrowCard') {
    Reflect.deleteProperty(info, 'showFooter')
    Reflect.deleteProperty(info, 'showHeaderExtra')
    if (raw?.showHeaderExtra) {
      Reflect.deleteProperty(info, 'header')
    }
    if (raw?.showFooter) {
      Reflect.deleteProperty(info, 'footer')
    }
  }

  if (tag === 'GrowModal' || tag === 'GrowDrawer') {
    Reflect.deleteProperty(info, 'showFooter')
  }

  if (tag === 'GrowLayout') {
    Reflect.deleteProperty(info, 'layout')
    Reflect.deleteProperty(info, 'headerHeight')
    Reflect.deleteProperty(info, 'asideWidth')
    Reflect.deleteProperty(info, 'footerHeight')
  }

  if (tag === 'GrowUpload') {
    // model 绑定写入的 modelValue → 同步到 file-list
    if (
      info.modelValue != null &&
      (info['file-list'] == null || info['file-list'] === '')
    ) {
      info['file-list'] = info.modelValue
    }
    if (
      info.modelValue != null &&
      (info.fileList == null || info.fileList === '')
    ) {
      info.fileList = info.modelValue
    }
  }

  if (tag === 'GrowTable') {
    Reflect.deleteProperty(info, 'fitLayoutMainHeight')
    Reflect.deleteProperty(info, 'columns')
    if (info.height === 'layout-main') {
      Reflect.deleteProperty(info, 'height')
    }
  }

  if (tag === 'GrowEllipsis') {
    if (info['expand-trigger'] === '' || info['expand-trigger'] == null) {
      Reflect.deleteProperty(info, 'expand-trigger')
    }
  }

  if (tag === 'GrowCalendar') {
    const start = info['range-start']
    const end = info['range-end']
    Reflect.deleteProperty(info, 'range-start')
    Reflect.deleteProperty(info, 'range-end')
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        info.range = [startDate, endDate]
      }
    }
    if (typeof info.modelValue === 'string' && info.modelValue) {
      const date = new Date(info.modelValue)
      if (!Number.isNaN(date.getTime())) {
        info.modelValue = date
      }
    }
  }

  if (tag === 'GrowTreeSelect') {
    if (info.options && !info.data) {
      const mapNodes = (nodes: any[]): any[] =>
        (nodes || []).map((node) => ({
          ...node,
          value: node.value ?? node.key,
          children: node.children ? mapNodes(node.children) : undefined,
        }))
      info.data = mapNodes(info.options)
    }
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
    if (info.filterable === undefined) {
      info.filterable = true
    }
  }

  if (tag === 'GrowMention') {
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
    if (info.split === undefined && info.separator !== undefined) {
      info.split = info.separator
    }
    if (info.options && !info.mentions) {
      info.mentions = info.options
    }
  }

  if (tag === 'GrowTimePicker') {
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
    if (info.valueFormat && !info.format) {
      info.format = info.valueFormat
    }
    if (info['time-zone'] === '' || info['time-zone'] == null) {
      Reflect.deleteProperty(info, 'time-zone')
    }
    if (info.timeZone === '' || info.timeZone == null) {
      Reflect.deleteProperty(info, 'timeZone')
    }
  }

  if (tag === 'GrowTime') {
    const coerceTime = (raw: unknown) => {
      if (raw == null || raw === '') return undefined
      if (raw instanceof Date) return raw.getTime()
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw
      const num = Number(String(raw).trim())
      return Number.isNaN(num) ? undefined : num
    }
    const time = coerceTime(info.time)
    const to = coerceTime(info.to)
    if (time !== undefined) info.time = time
    else Reflect.deleteProperty(info, 'time')
    if (to !== undefined) info.to = to
    else Reflect.deleteProperty(info, 'to')
    if (info['time-zone'] === '' || info['time-zone'] == null) {
      Reflect.deleteProperty(info, 'time-zone')
    }
    if (info.timeZone === '' || info.timeZone == null) {
      Reflect.deleteProperty(info, 'timeZone')
    }
  }

  // 滚动条：% 高度相对渲染根实测高度（--grow-renderer-height）
  if (tag === 'GrowScrollbar') {
    if (info.height != null && info.height !== '') {
      info.height = toRendererRelativeSize(info.height)
    }
    if (info['max-height'] != null && info['max-height'] !== '') {
      info['max-height'] = toRendererRelativeSize(info['max-height'])
    }
  }

  return info
}

/** 将 % 尺寸换算为相对 GrowRenderer 根节点高度 */
export function toRendererRelativeSize(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  const str = String(value).trim()
  if (!str) return undefined
  const matched = str.match(/^(-?\d+(?:\.\d+)?)%$/)
  if (!matched) return str
  return `calc(var(--grow-renderer-height, 100%) * ${matched[1]} / 100)`
}

export function resolveNodeStyle(
  styles: Record<string, any> | undefined,
): Record<string, any> {
  if (!styles) return {}
  const { class: _c, ...rest } = styles
  return rest
}

export function resolveNodeClass(
  styles: Record<string, any> | undefined,
): string | undefined {
  return styles?.class
}

export { BASIC_TEXT_TAGS, TEXT_CONTENT_TAGS }
