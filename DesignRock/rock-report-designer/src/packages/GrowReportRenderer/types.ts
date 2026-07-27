import type { ReportChartType } from './chartTypes'
import type { ReportChartConfig } from './chartConfig'

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
}

export type ReportPageConfig = {
  colNum?: number
  rowHeight?: number
}

/** 报表设计器导出的 JSON schema，供 GrowReportRenderer 渲染 */
export type ReportSchema = {
  layout?: ReportLayoutItem[]
  pageConfig?: ReportPageConfig
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
): ReportSchema {
  return {
    layout: layout.map((item) => ({ ...item })),
    pageConfig: {
      colNum: REPORT_GRID_COL_NUM,
      rowHeight: REPORT_GRID_ROW_HEIGHT,
      ...pageConfig,
    },
  }
}
