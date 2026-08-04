/** 模块 props 按 tag 归一化（设计器 / 预览共用） */

import { normalizePaginationBindProps } from '../../GrowDesigner/static/paginationProps'

export const TEXT_CONTENT_TAGS = new Set([
  'GrowButton',
  'GrowLink',
  'GrowEllipsis',
  'GrowTag',
])

const stripEmptyTimezone = (info: Record<string, any>) => {
  if (info['time-zone'] === '' || info['time-zone'] == null) {
    Reflect.deleteProperty(info, 'time-zone')
  }
  if (info.timeZone === '' || info.timeZone == null) {
    Reflect.deleteProperty(info, 'timeZone')
  }
}

/** value ↔ modelValue 双向补齐 */
const syncValueModelValue = (info: Record<string, any>) => {
  if (info.value === undefined && info.modelValue !== undefined) {
    info.value = info.modelValue
  }
  if (info.modelValue === undefined && info.value !== undefined) {
    info.modelValue = info.value
  }
}

const mapTreeSelectNodes = (nodes: any[]): any[] =>
  (nodes || []).map((node) => ({
    ...node,
    value: node.value ?? node.key,
    children: node.children ? mapTreeSelectNodes(node.children) : undefined,
  }))

const coerceTimeValue = (raw: unknown) => {
  if (raw == null || raw === '') return undefined
  if (raw instanceof Date) return raw.getTime()
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const num = Number(String(raw).trim())
  return Number.isNaN(num) ? undefined : num
}

export const stripDesignerControlProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'model')
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')
}

export const normalizeGrowColumnBarProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'columnsSource')
  Reflect.deleteProperty(info, 'tableUuid')
}

export const normalizeGrowCardProps = (
  info: Record<string, any>,
  raw?: Record<string, any>,
) => {
  Reflect.deleteProperty(info, 'showFooter')
  Reflect.deleteProperty(info, 'showHeaderExtra')
  if (raw?.showHeaderExtra) Reflect.deleteProperty(info, 'header')
  if (raw?.showFooter) Reflect.deleteProperty(info, 'footer')
}

export const normalizeGrowModalDrawerProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'showFooter')
}

export const normalizeGrowLayoutProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'layout')
  Reflect.deleteProperty(info, 'headerHeight')
  Reflect.deleteProperty(info, 'asideWidth')
  Reflect.deleteProperty(info, 'footerHeight')
}

export const normalizeGrowUploadProps = (info: Record<string, any>) => {
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

export const normalizeGrowTableProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'fitLayoutMainHeight')
  Reflect.deleteProperty(info, 'columns')
  if (info.height === 'layout-main') {
    Reflect.deleteProperty(info, 'height')
  }
}

/** 设计器表格：layout-main / fitLayoutMainHeight 时注入实测高度 */
export const applyGrowTableLayoutMainHeight = (
  info: Record<string, any>,
  raw: Record<string, any> | undefined,
  options?: NormalizeModulePropsOptions,
) => {
  const isLayoutMain =
    raw?.height === 'layout-main' || Boolean(options?.fitLayoutMainHeight)
  if (!isLayoutMain) return
  Reflect.deleteProperty(info, 'height')
  if (options?.layoutMainHeight != null && options.layoutMainHeight > 0) {
    info.height = options.layoutMainHeight
  }
}

export const normalizeGrowEllipsisProps = (info: Record<string, any>) => {
  if (info['expand-trigger'] === '' || info['expand-trigger'] == null) {
    Reflect.deleteProperty(info, 'expand-trigger')
  }
}

export const normalizeGrowDropdownProps = (info: Record<string, any>) => {
  if (info.type === '' || info.type == null) {
    Reflect.deleteProperty(info, 'type')
  }
}

/**
 * NImage 的 width/height 会落到 img HTML 属性（需无单位数字）。
 * 纯数字 / "120" / "120px" → number；带 %/vw 等单位时保留字符串（由驱动侧或 style 承接）。
 */
export const normalizeGrowImageProps = (info: Record<string, any>) => {
  const normalizeSize = (key: 'width' | 'height') => {
    const value = info[key]
    if (value == null || value === '') {
      Reflect.deleteProperty(info, key)
      return
    }
    if (typeof value === 'number' && Number.isFinite(value)) return
    const raw = String(value).trim()
    if (!raw) {
      Reflect.deleteProperty(info, key)
      return
    }
    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      info[key] = Number(raw)
      return
    }
    const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/i)
    if (px) {
      info[key] = Number(px[1])
      return
    }
    info[key] = raw
  }
  normalizeSize('width')
  normalizeSize('height')
}

export const normalizeGrowCalendarProps = (info: Record<string, any>) => {
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

export const normalizeGrowTreeSelectProps = (
  info: Record<string, any>,
  options?: Pick<NormalizeModulePropsOptions, 'defaultTreeSelectFilterable'>,
) => {
  if (info.options && !info.data) {
    info.data = mapTreeSelectNodes(info.options)
  }
  syncValueModelValue(info)
  // 仅运行时默认开启；设计器保持原样，避免改变画布交互
  if (options?.defaultTreeSelectFilterable && info.filterable === undefined) {
    info.filterable = true
  }
}

export const normalizeGrowMentionProps = (info: Record<string, any>) => {
  syncValueModelValue(info)
  if (info.split === undefined && info.separator !== undefined) {
    info.split = info.separator
  }
  if (info.options && !info.mentions) {
    info.mentions = info.options
  }
}

export const normalizeGrowTimePickerProps = (info: Record<string, any>) => {
  syncValueModelValue(info)
  if (info.valueFormat && !info.format) {
    info.format = info.valueFormat
  }
  stripEmptyTimezone(info)
}

export const normalizeGrowTimeProps = (info: Record<string, any>) => {
  const time = coerceTimeValue(info.time)
  const to = coerceTimeValue(info.to)
  if (time !== undefined) info.time = time
  else Reflect.deleteProperty(info, 'time')
  if (to !== undefined) info.to = to
  else Reflect.deleteProperty(info, 'to')
  stripEmptyTimezone(info)
}

export const normalizeGrowSearchBarDefaultData = (info: Record<string, any>) => {
  if (
    info.defaultData == null ||
    info.defaultData === '' ||
    typeof info.defaultData !== 'object' ||
    Array.isArray(info.defaultData)
  ) {
    info.defaultData = {}
  }
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

export const normalizeGrowScrollbarProps = (info: Record<string, any>) => {
  if (info.height != null && info.height !== '') {
    info.height = toRendererRelativeSize(info.height)
  }
  if (info['max-height'] != null && info['max-height'] !== '') {
    info['max-height'] = toRendererRelativeSize(info['max-height'])
  }
}

export type NormalizeModulePropsOptions = {
  /** 设计器 ColumnBar 强制 disabled */
  disableColumnBar?: boolean
  /** 设计器表格：layout-main 时注入实测高度 */
  layoutMainHeight?: number
  /** 设计器表格：兼容 fitLayoutMainHeight 开关 */
  fitLayoutMainHeight?: boolean
  /** 运行时 TreeSelect 默认开启 filterable */
  defaultTreeSelectFilterable?: boolean
}

const applyStructuralTagRules = (
  tag: string,
  info: Record<string, any>,
  raw?: Record<string, any>,
  options?: NormalizeModulePropsOptions,
) => {
  if (tag === 'GrowColumnBar') {
    normalizeGrowColumnBarProps(info)
    if (options?.disableColumnBar) info.disabled = true
  }
  if (TEXT_CONTENT_TAGS.has(tag)) Reflect.deleteProperty(info, 'content')
  if (tag === 'GrowCard') normalizeGrowCardProps(info, raw)
  if (tag === 'GrowModal' || tag === 'GrowDrawer') {
    normalizeGrowModalDrawerProps(info)
  }
  if (tag === 'GrowLayout') normalizeGrowLayoutProps(info)
  if (tag === 'GrowUpload') normalizeGrowUploadProps(info)
  if (tag === 'GrowTable') {
    normalizeGrowTableProps(info)
    applyGrowTableLayoutMainHeight(info, raw, options)
  }
}

const applyValueTagRules = (
  tag: string,
  info: Record<string, any>,
  options?: NormalizeModulePropsOptions,
) => {
  if (tag === 'GrowEllipsis') normalizeGrowEllipsisProps(info)
  if (tag === 'GrowDropdown') normalizeGrowDropdownProps(info)
  if (tag === 'GrowImage') normalizeGrowImageProps(info)
  if (tag === 'GrowCalendar') normalizeGrowCalendarProps(info)
  if (tag === 'GrowTreeSelect') {
    normalizeGrowTreeSelectProps(info, {
      defaultTreeSelectFilterable: options?.defaultTreeSelectFilterable,
    })
  }
  if (tag === 'GrowMention') normalizeGrowMentionProps(info)
  if (tag === 'GrowTimePicker') normalizeGrowTimePickerProps(info)
  if (tag === 'GrowTime') normalizeGrowTimeProps(info)
  if (tag === 'GrowSearchBar') normalizeGrowSearchBarDefaultData(info)
  if (tag === 'GrowScrollbar') normalizeGrowScrollbarProps(info)
}

/**
 * 按 tag 归一化模块 props。
 * 设计器可传 options 覆盖表格高度 / ColumnBar disabled 等差异点。
 */
export function normalizeModulePropsByTag(
  tag: string,
  info: Record<string, any>,
  raw?: Record<string, any>,
  options?: NormalizeModulePropsOptions,
): Record<string, any> {
  stripDesignerControlProps(info)
  applyStructuralTagRules(tag, info, raw, options)
  if (tag === 'GrowPagination') {
    return normalizePaginationBindProps(info, { uncontrolled: false })
  }
  applyValueTagRules(tag, info, options)
  return info
}
