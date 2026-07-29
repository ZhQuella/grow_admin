import type { ReportChartType } from './chartTypes'
import type { ReportChartConfig } from './chartConfig'
import type { ReportBlockDataBinding } from './dataBinding'
import { cloneDeep } from '@grow-admin-rock/utils'

/** 设计器 / 运行时共用的报表 schema */

export const REPORT_GRID_COL_NUM = 24
export const REPORT_GRID_ROW_HEIGHT = 30

export type { ReportChartType, CartesianSeriesType, ReportChartTypeOption } from './chartTypes'
export {
  REPORT_CHART_TYPE_OPTIONS,
  CARTESIAN_SERIES_TYPE_OPTIONS,
  DEFAULT_REPORT_CHART_TYPE,
  getReportChartTypeOption,
  toChartTypeSoftBg,
} from './chartTypes'
export type { ReportChartConfig } from './chartConfig'
export {
  createDefaultChartConfig,
  getChartOptionFields,
  buildEChartsOption,
} from './chartConfig'
export type {
  ReportBlockDataBinding,
  ReportDataBindRef,
  ReportDataBindMode,
} from './dataBinding'

export type ReportLayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  title: string
  /** 是否显示卡片标题 */
  showTitle: boolean
  /** 报表图表类型 */
  chartType: ReportChartType
  /** 图表视觉配置（对齐 ECharts，不含数据） */
  chartConfig?: ReportChartConfig
  /** 区块数据绑定（引用页面 state） */
  dataBinding?: ReportBlockDataBinding
}

export type ReportPageConfig = {
  /** 列数 */
  colNum?: number
  /** 行高（px） */
  rowHeight?: number
  /** 最大行数；未设置表示不限 */
  maxRows?: number
  /** 网格项间距 [水平, 垂直]（px） */
  margin?: [number, number]
  isDraggable?: boolean
  isResizable?: boolean
  isMirrored?: boolean
  isBounded?: boolean
  autoSize?: boolean
  verticalCompact?: boolean
  restoreOnDrag?: boolean
  preventCollision?: boolean
  useCssTransforms?: boolean
  responsive?: boolean
  breakpoints?: { lg: number; md: number; sm: number; xs: number; xxs: number }
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number }
  useStyleCursor?: boolean
  transformScale?: number
  /** 页面生命周期事件：onMounted 等 */
  events?: Record<string, unknown>
}

/** GridLayout 页面配置默认值（对齐 vue3-grid-layout，列数/行高沿用报表约定） */
export function createDefaultPageConfig(): ReportPageConfig {
  return {
    colNum: REPORT_GRID_COL_NUM,
    rowHeight: REPORT_GRID_ROW_HEIGHT,
    margin: [10, 10],
    isDraggable: true,
    isResizable: true,
    isMirrored: false,
    isBounded: false,
    autoSize: true,
    verticalCompact: true,
    restoreOnDrag: false,
    preventCollision: false,
    useCssTransforms: true,
    responsive: false,
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    useStyleCursor: true,
    transformScale: 1,
  }
}

/**
 * 报表设计器导出的 JSON schema
 * 页面级 dataSource / apiOutlined / computedProps / pageConfig 对齐 GrowDesigner
 */
export type ReportSchema = {
  layout?: ReportLayoutItem[]
  pageConfig?: ReportPageConfig
  dataSource?: unknown[]
  apiOutlined?: unknown[]
  computedProps?: unknown[]
}

export function toPreviewItemStyle(
  item: Pick<ReportLayoutItem, 'x' | 'y' | 'w' | 'h'>,
  colNum = REPORT_GRID_COL_NUM,
  rowHeight = REPORT_GRID_ROW_HEIGHT,
  margin: [number, number] = [10, 10],
): Record<string, string> {
  const [marginX, marginY] = margin
  return {
    left: `${(item.x / colNum) * 100}%`,
    width: `${(item.w / colNum) * 100}%`,
    top: `${item.y * rowHeight}px`,
    height: `${item.h * rowHeight}px`,
    padding: `${Math.max(marginY, 0) / 2}px ${Math.max(marginX, 0) / 2}px`,
  }
}

/** 与 vue3-grid-layout 一致的单项像素几何（预览用，冻结设计坐标） */
export function calcGridItemRect(
  item: Pick<ReportLayoutItem, 'x' | 'y' | 'w' | 'h'>,
  options: {
    colNum: number
    rowHeight: number
    margin: [number, number]
    containerWidth: number
    isMirrored?: boolean
  },
): { left: number; top: number; width: number; height: number } {
  const colNum = Math.max(1, options.colNum)
  const rowHeight = Math.max(1, options.rowHeight)
  const [marginX, marginY] = options.margin
  const containerWidth = Math.max(0, options.containerWidth)
  const colWidth = (containerWidth - marginX * (colNum + 1)) / colNum

  const width = Math.round(colWidth * item.w + Math.max(0, item.w - 1) * marginX)
  const height = Math.round(rowHeight * item.h + Math.max(0, item.h - 1) * marginY)
  const rawLeft = Math.round(colWidth * item.x + (item.x + 1) * marginX)
  const top = Math.round(rowHeight * item.y + (item.y + 1) * marginY)
  const left = options.isMirrored ? Math.round(containerWidth - (rawLeft + width)) : rawLeft

  return { left, top, width, height }
}

export function toGridPreviewItemStyle(
  item: Pick<ReportLayoutItem, 'x' | 'y' | 'w' | 'h'>,
  options: {
    colNum: number
    rowHeight: number
    margin: [number, number]
    containerWidth: number
    isMirrored?: boolean
    useCssTransforms?: boolean
    transformScale?: number
  },
): Record<string, string> {
  const rect = calcGridItemRect(item, options)
  const scale = options.transformScale ?? 1
  const style: Record<string, string> = {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }

  if (options.useCssTransforms !== false) {
    style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${scale})`
    style.transformOrigin = '0 0'
  } else {
    style.left = `${rect.left}px`
    style.top = `${rect.top}px`
    if (scale !== 1) {
      style.transform = `scale(${scale})`
      style.transformOrigin = '0 0'
    }
  }

  return style
}

export function getPreviewBoardHeight(
  layout: ReportLayoutItem[],
  rowHeight = REPORT_GRID_ROW_HEIGHT,
  margin: [number, number] = [10, 10],
): string {
  if (!layout.length) return '240px'
  const bottom = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)
  const marginY = margin[1] ?? 10
  return `${Math.max(bottom * rowHeight + (bottom + 1) * marginY, 240)}px`
}

/** 设计器 / 预览共用的 Grid 解析结果 */
export type ResolvedReportGridConfig = {
  colNum: number
  rowHeight: number
  maxRows: number
  margin: [number, number]
  isDraggable: boolean
  isResizable: boolean
  isMirrored: boolean
  isBounded: boolean
  autoSize: boolean
  verticalCompact: boolean
  restoreOnDrag: boolean
  preventCollision: boolean
  useCssTransforms: boolean
  responsive: boolean
  breakpoints: NonNullable<ReportPageConfig['breakpoints']>
  cols: NonNullable<ReportPageConfig['cols']>
  useStyleCursor: boolean
  transformScale: number
}

export function resolveReportGridConfig(
  pageConfig?: ReportPageConfig | null,
): ResolvedReportGridConfig {
  const defaults = createDefaultPageConfig()
  const current = pageConfig || {}
  return {
    colNum: current.colNum ?? defaults.colNum!,
    rowHeight: current.rowHeight ?? defaults.rowHeight!,
    maxRows: current.maxRows ?? Infinity,
    margin: (current.margin?.length === 2 ? current.margin : defaults.margin!) as [
      number,
      number,
    ],
    isDraggable: current.isDraggable ?? defaults.isDraggable!,
    isResizable: current.isResizable ?? defaults.isResizable!,
    isMirrored: current.isMirrored ?? defaults.isMirrored!,
    isBounded: current.isBounded ?? defaults.isBounded!,
    autoSize: current.autoSize ?? defaults.autoSize!,
    verticalCompact: current.verticalCompact ?? defaults.verticalCompact!,
    restoreOnDrag: current.restoreOnDrag ?? defaults.restoreOnDrag!,
    preventCollision: current.preventCollision ?? defaults.preventCollision!,
    useCssTransforms: current.useCssTransforms ?? defaults.useCssTransforms!,
    responsive: current.responsive ?? defaults.responsive!,
    breakpoints: current.breakpoints || defaults.breakpoints!,
    cols: current.cols || defaults.cols!,
    useStyleCursor: current.useStyleCursor ?? defaults.useStyleCursor!,
    transformScale: current.transformScale ?? defaults.transformScale!,
  }
}

export function createReportSchema(
  layout: ReportLayoutItem[],
  pageConfig?: ReportPageConfig,
  pageData?: Pick<ReportSchema, 'dataSource' | 'apiOutlined' | 'computedProps'>,
): ReportSchema {
  return {
    layout: cloneDeep(layout || []),
    pageConfig: {
      ...createDefaultPageConfig(),
      ...pageConfig,
      margin: pageConfig?.margin?.length === 2 ? [...pageConfig.margin] as [number, number] : [10, 10],
      breakpoints: pageConfig?.breakpoints
        ? { ...pageConfig.breakpoints }
        : createDefaultPageConfig().breakpoints,
      cols: pageConfig?.cols ? { ...pageConfig.cols } : createDefaultPageConfig().cols,
      events: pageConfig?.events ? { ...pageConfig.events } : undefined,
    },
    dataSource: pageData?.dataSource ? cloneDeep(pageData.dataSource) : [],
    apiOutlined: pageData?.apiOutlined ? cloneDeep(pageData.apiOutlined) : [],
    computedProps: pageData?.computedProps ? cloneDeep(pageData.computedProps) : [],
  }
}
