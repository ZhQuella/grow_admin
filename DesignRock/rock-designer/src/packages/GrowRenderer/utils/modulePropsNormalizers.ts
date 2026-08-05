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

/**
 * 设计器平铺字段 → ElCascader CascaderProps（camelCase）
 * value/label/children/disabled/leaf 用 *-key，避免与顶层 disabled 等冲突
 */
const CASCADER_PROPS_FLAT_MAP: Array<{
  flat: string
  nested: string
  kind: 'bool' | 'string' | 'number' | 'function' | 'enum'
  aliases?: string[]
}> = [
  { flat: 'expand-trigger', nested: 'expandTrigger', kind: 'enum' },
  { flat: 'multiple', nested: 'multiple', kind: 'bool' },
  { flat: 'check-strictly', nested: 'checkStrictly', kind: 'bool' },
  { flat: 'emit-path', nested: 'emitPath', kind: 'bool' },
  { flat: 'lazy', nested: 'lazy', kind: 'bool' },
  {
    flat: 'lazy-load',
    nested: 'lazyLoad',
    kind: 'function',
    aliases: ['lazyLoad'],
  },
  { flat: 'value-key', nested: 'value', kind: 'string', aliases: ['valueKey'] },
  { flat: 'label-key', nested: 'label', kind: 'string', aliases: ['labelKey'] },
  {
    flat: 'children-key',
    nested: 'children',
    kind: 'string',
    aliases: ['childrenKey'],
  },
  {
    flat: 'disabled-key',
    nested: 'disabled',
    kind: 'string',
    aliases: ['disabledKey'],
  },
  { flat: 'leaf-key', nested: 'leaf', kind: 'string', aliases: ['leafKey'] },
  {
    flat: 'hover-threshold',
    nested: 'hoverThreshold',
    kind: 'number',
    aliases: ['hoverThreshold'],
  },
  {
    flat: 'check-on-click-node',
    nested: 'checkOnClickNode',
    kind: 'bool',
    aliases: ['checkOnClickNode'],
  },
  {
    flat: 'check-on-click-leaf',
    nested: 'checkOnClickLeaf',
    kind: 'bool',
    aliases: ['checkOnClickLeaf'],
  },
  {
    flat: 'show-prefix',
    nested: 'showPrefix',
    kind: 'bool',
    aliases: ['showPrefix'],
  },
]

const readCascaderPropFlatValue = (
  info: Record<string, any>,
  flat: string,
  aliases?: string[],
) => {
  if (Object.prototype.hasOwnProperty.call(info, flat)) return info[flat]
  if (aliases) {
    for (const alias of aliases) {
      if (Object.prototype.hasOwnProperty.call(info, alias)) return info[alias]
    }
  }
  return undefined
}

const coerceCascaderPropValue = (
  kind: 'bool' | 'string' | 'number' | 'function' | 'enum',
  raw: unknown,
) => {
  if (raw == null || raw === '') return undefined
  if (kind === 'bool') return Boolean(raw)
  if (kind === 'number') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  if (kind === 'function') {
    return typeof raw === 'function' ? raw : undefined
  }
  if (kind === 'enum' || kind === 'string') {
    const s = String(raw).trim()
    return s || undefined
  }
  return undefined
}

/**
 * 级联：设计器平铺的 CascaderProps 字段写入 ElCascader 的 props
 * 预览 / 运行时必须走此归一化，否则顶层 lazy 等不会生效
 */
export const normalizeGrowCascaderProps = (info: Record<string, any>) => {
  const existing =
    info.props && typeof info.props === 'object' && !Array.isArray(info.props)
      ? { ...info.props }
      : {}

  for (const { flat, nested, kind, aliases } of CASCADER_PROPS_FLAT_MAP) {
    const hasFlat =
      Object.prototype.hasOwnProperty.call(info, flat) ||
      Boolean(aliases?.some((a) => Object.prototype.hasOwnProperty.call(info, a)))

    if (hasFlat) {
      const coerced = coerceCascaderPropValue(
        kind,
        readCascaderPropFlatValue(info, flat, aliases),
      )
      if (coerced !== undefined) {
        existing[nested] = coerced
      } else {
        // 未编译成功的函数 / 空值不要塞进 CascaderProps
        Reflect.deleteProperty(existing, nested)
      }
    }

    Reflect.deleteProperty(info, flat)
    aliases?.forEach((alias) => Reflect.deleteProperty(info, alias))
  }

  if (Object.keys(existing).length) {
    info.props = existing
  } else {
    Reflect.deleteProperty(info, 'props')
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

/** 保证 patterns 为字符串数组，便于 NHighlight 匹配 */
export const normalizeGrowHighlightProps = (info: Record<string, any>) => {
  const raw = info.patterns
  if (raw == null || raw === '') {
    info.patterns = []
    return
  }
  if (Array.isArray(raw)) {
    info.patterns = raw
      .map((item) => (item == null ? '' : String(item).trim()))
      .filter(Boolean)
    return
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) {
      info.patterns = []
      return
    }
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        info.patterns = parsed
          .map((item) => (item == null ? '' : String(item).trim()))
          .filter(Boolean)
        return
      }
    } catch {
      // 非 JSON：按逗号分隔
    }
    info.patterns = trimmed
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

/** Naive current 从 1 起；items 由包装层消费，不透传底层 */
export const normalizeGrowStepsProps = (info: Record<string, any>) => {
  Reflect.deleteProperty(info, 'name')
  Reflect.deleteProperty(info, '__stepsItems__')
  if (info.current != null && info.current !== '') {
    const n = Number(info.current)
    if (Number.isFinite(n)) info.current = n
  }
  // 绑定模式下 items 为表达式字符串，由 resolveBoundProps 解析；此处仅规范化数组
  if (Array.isArray(info.items)) {
    info.items = info.items.map((item: any, index: number) => {
      if (!item || typeof item !== 'object') {
        return { title: String(item ?? `步骤 ${index + 1}`) }
      }
      const next = { ...item }
      if (next.status === '' || next.status == null) {
        Reflect.deleteProperty(next, 'status')
      }
      Reflect.deleteProperty(next, 'name')
      Reflect.deleteProperty(next, 'id')
      Reflect.deleteProperty(next, 'bindModes')
      return next
    })
  }
}

export const normalizeGrowStepProps = (info: Record<string, any>) => {
  // ChildPaneNames 写入的 name 非 Naive Step 属性
  Reflect.deleteProperty(info, 'name')
  if (info.status === '' || info.status == null) {
    Reflect.deleteProperty(info, 'status')
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

export const normalizeGrowAutoCompleteProps = (info: Record<string, any>) => {
  syncValueModelValue(info)
  // 空 status 不是合法值，避免落到 NAutoComplete / EP 校验
  if (info.status === '' || info.status == null) {
    Reflect.deleteProperty(info, 'status')
  }
  if (info['z-index'] != null && info['z-index'] !== '') {
    const n = Number(info['z-index'])
    if (Number.isFinite(n)) info['z-index'] = n
    else Reflect.deleteProperty(info, 'z-index')
  }
  if (info.zIndex != null && info.zIndex !== '') {
    const n = Number(info.zIndex)
    if (Number.isFinite(n)) info.zIndex = n
    else Reflect.deleteProperty(info, 'zIndex')
  }
  // EP ElAutocomplete 不支持 left/right placement，非法值改为默认
  const placement = info.placement ?? info['placement']
  if (placement != null && placement !== '') {
    const allowed = new Set([
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
    ])
    if (!allowed.has(String(placement))) {
      info.placement = 'bottom-start'
    }
  }
  // 文本模式误填 JSON 字符串时尝试解析为 options
  if (typeof info.options === 'string') {
    const raw = info.options.trim()
    if (!raw) {
      info.options = []
    } else {
      try {
        const parsed = JSON.parse(raw)
        info.options = Array.isArray(parsed) ? parsed : []
      } catch {
        info.options = raw
          .split(/[,，\n]/)
          .map((item: string) => item.trim())
          .filter(Boolean)
      }
    }
  }
  if (info.options != null && !Array.isArray(info.options)) {
    info.options = []
  }
}

export const normalizeGrowDynamicTagsProps = (info: Record<string, any>) => {
  syncValueModelValue(info)
  if (!Array.isArray(info.value) && info.value != null && info.value !== '') {
    info.value = [String(info.value)]
  }
  if (!Array.isArray(info.modelValue) && info.modelValue != null && info.modelValue !== '') {
    info.modelValue = [String(info.modelValue)]
  }
  if (info.max != null && info.max !== '') {
    const n = Number(info.max)
    if (Number.isFinite(n)) info.max = n
    else Reflect.deleteProperty(info, 'max')
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
  if (tag === 'GrowCascader') normalizeGrowCascaderProps(info)
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
  if (tag === 'GrowHighlight') normalizeGrowHighlightProps(info)
  if (tag === 'GrowSteps') normalizeGrowStepsProps(info)
  if (tag === 'GrowStep') normalizeGrowStepProps(info)
  if (tag === 'GrowImage') normalizeGrowImageProps(info)
  if (tag === 'GrowCalendar') normalizeGrowCalendarProps(info)
  if (tag === 'GrowTreeSelect') {
    normalizeGrowTreeSelectProps(info, {
      defaultTreeSelectFilterable: options?.defaultTreeSelectFilterable,
    })
  }
  if (tag === 'GrowMention') normalizeGrowMentionProps(info)
  if (tag === 'GrowAutoComplete') normalizeGrowAutoCompleteProps(info)
  if (tag === 'GrowDynamicTags') normalizeGrowDynamicTagsProps(info)
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
