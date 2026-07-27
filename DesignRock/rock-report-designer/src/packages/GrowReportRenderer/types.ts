import type { ReportChartType } from './chartTypes'
import type { ReportChartConfig } from './chartConfig'
import type { ReportBlockDataBinding } from './dataBinding'

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
  colNum?: number
  rowHeight?: number
}

/**
 * 报表设计器导出的 JSON schema
 * 页面级 dataSource / apiOutlined / computedProps 对齐 GrowDesigner
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
): Record<string, string> {
  return {
    left: `${(item.x / colNum) * 100}%`,
    width: `${(item.w / colNum) * 100}%`,
    top: `${item.y * rowHeight}px`,
    height: `${item.h * rowHeight}px`,
  }
}

export function getPreviewBoardHeight(
  layout: ReportLayoutItem[],
  rowHeight = REPORT_GRID_ROW_HEIGHT,
): string {
  if (!layout.length) return '240px'
  const rows = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)
  return `${Math.max(rows * rowHeight, 240)}px`
}

export function createReportSchema(
  layout: ReportLayoutItem[],
  pageConfig?: ReportPageConfig,
  pageData?: Pick<ReportSchema, 'dataSource' | 'apiOutlined' | 'computedProps'>,
): ReportSchema {
  return {
    layout: layout.map((item) => ({ ...item })),
    pageConfig: {
      colNum: REPORT_GRID_COL_NUM,
      rowHeight: REPORT_GRID_ROW_HEIGHT,
      ...pageConfig,
    },
    dataSource: pageData?.dataSource ? [...pageData.dataSource] : [],
    apiOutlined: pageData?.apiOutlined ? [...pageData.apiOutlined] : [],
    computedProps: pageData?.computedProps ? [...pageData.computedProps] : [],
  }
}
