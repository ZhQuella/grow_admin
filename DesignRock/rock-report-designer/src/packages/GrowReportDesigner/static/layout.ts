import { cloneDeep } from '@grow-admin-rock/utils'
import type { ReportLayoutItem } from '../../GrowReportRenderer/types'
import {
  REPORT_GRID_COL_NUM,
  DEFAULT_REPORT_CHART_TYPE,
  createDefaultChartConfig,
} from '../../GrowReportRenderer/types'

export {
  REPORT_GRID_COL_NUM,
  REPORT_GRID_ROW_HEIGHT,
  DEFAULT_REPORT_CHART_TYPE,
} from '../../GrowReportRenderer/types'
export type { ReportLayoutItem, ReportChartType } from '../../GrowReportRenderer/types'

export const REPORT_BLOCK_DEFAULT_W = REPORT_GRID_COL_NUM
export const REPORT_BLOCK_DEFAULT_H = 4

function collides(
  x: number,
  y: number,
  w: number,
  h: number,
  items: ReportLayoutItem[],
): boolean {
  return items.some(
    (item) =>
      x < item.x + item.w &&
      x + w > item.x &&
      y < item.y + item.h &&
      y + h > item.y,
  )
}

/** 从左到右、自上而下找下一个可放置位置（满行自动换行） */
export function findNextPosition(
  layout: ReportLayoutItem[],
  w = REPORT_BLOCK_DEFAULT_W,
  h = REPORT_BLOCK_DEFAULT_H,
  colNum = REPORT_GRID_COL_NUM,
): { x: number; y: number } {
  const safeW = Math.min(Math.max(w, 1), colNum)
  if (!layout.length) return { x: 0, y: 0 }

  const maxBottom = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)

  for (let y = 0; y <= maxBottom; y++) {
    for (let x = 0; x <= colNum - safeW; x++) {
      if (!collides(x, y, safeW, h, layout)) {
        return { x, y }
      }
    }
  }

  return { x: 0, y: maxBottom }
}

export function createLayoutItem(
  layout: ReportLayoutItem[],
  id: string,
  index: number,
  colNum = REPORT_GRID_COL_NUM,
): ReportLayoutItem {
  const w = Math.min(REPORT_BLOCK_DEFAULT_W, colNum)
  const { x, y } = findNextPosition(layout, w, REPORT_BLOCK_DEFAULT_H, colNum)
  return {
    i: id,
    x,
    y,
    w,
    h: REPORT_BLOCK_DEFAULT_H,
    title: `区块 ${index}`,
    showTitle: true,
    chartType: DEFAULT_REPORT_CHART_TYPE,
    chartConfig: createDefaultChartConfig(DEFAULT_REPORT_CHART_TYPE),
  }
}

/** 复制区块：保留尺寸与配置，放到下一个空位 */
export function copyLayoutItem(
  layout: ReportLayoutItem[],
  source: ReportLayoutItem,
  id: string,
  colNum = REPORT_GRID_COL_NUM,
): ReportLayoutItem {
  const w = Math.min(source.w, colNum)
  const { x, y } = findNextPosition(layout, w, source.h, colNum)
  return {
    ...source,
    i: id,
    x,
    y,
    w,
    title: `${source.title} 副本`,
    chartConfig: cloneDeep(
      source.chartConfig ?? createDefaultChartConfig(source.chartType),
    ),
    dataBinding: source.dataBinding ? cloneDeep(source.dataBinding) : undefined,
  }
}
