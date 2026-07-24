/** 报表图表类型（对齐 ECharts 常见系列） */
export type ReportChartType =
  | 'line'
  | 'bar'
  | 'scatter'
  | 'map'
  | 'candlestick'
  | 'radar'
  | 'boxplot'
  | 'heatmap'
  | 'graph'
  | 'tree'
  | 'treemap'
  | 'sunburst'
  | 'parallel'
  | 'sankey'
  | 'funnel'
  | 'gauge'
  | 'themeRiver'
  | 'calendar'
  | 'matrix'
  | 'chord'

export type ReportChartTypeOption = {
  value: ReportChartType
  /** 完整名称 */
  label: string
  /** 列表展示用短名 */
  shortLabel: string
  icon: string
  /** 强调色 */
  color: string
}

export const REPORT_CHART_TYPE_OPTIONS: ReportChartTypeOption[] = [
  { value: 'line', label: '折线图', shortLabel: '折线', icon: 'carbon:chart-line', color: '#2563EB' },
  { value: 'bar', label: '柱状图', shortLabel: '柱状', icon: 'carbon:chart-bar', color: '#D97706' },
  { value: 'scatter', label: '散点图', shortLabel: '散点', icon: 'carbon:chart-scatter', color: '#059669' },
  { value: 'map', label: '地理坐标/地图', shortLabel: '地图', icon: 'carbon:map', color: '#0891B2' },
  { value: 'candlestick', label: 'K线图', shortLabel: 'K线', icon: 'carbon:chart-candlestick', color: '#DC2626' },
  { value: 'radar', label: '雷达图', shortLabel: '雷达', icon: 'carbon:chart-radar', color: '#7C3AED' },
  { value: 'boxplot', label: '盒须图', shortLabel: '盒须', icon: 'carbon:box-plot', color: '#DB2777' },
  { value: 'heatmap', label: '热力图', shortLabel: '热力', icon: 'carbon:heat-map-02', color: '#EA580C' },
  { value: 'graph', label: '关系图', shortLabel: '关系', icon: 'carbon:network-4', color: '#0D9488' },
  { value: 'tree', label: '树图', shortLabel: '树图', icon: 'carbon:tree-view-alt', color: '#16A34A' },
  { value: 'treemap', label: '矩形树图', shortLabel: '矩树', icon: 'carbon:chart-treemap', color: '#0284C7' },
  { value: 'sunburst', label: '旭日图', shortLabel: '旭日', icon: 'carbon:chart-ring', color: '#CA8A04' },
  { value: 'parallel', label: '平行坐标系', shortLabel: '平行', icon: 'carbon:chart-multi-line', color: '#4F46E5' },
  { value: 'sankey', label: '桑基图', shortLabel: '桑基', icon: 'carbon:flow', color: '#9333EA' },
  { value: 'funnel', label: '漏斗图', shortLabel: '漏斗', icon: 'carbon:filter', color: '#C026D3' },
  { value: 'gauge', label: '仪表盘', shortLabel: '仪表', icon: 'carbon:meter', color: '#E11D48' },
  { value: 'themeRiver', label: '主题河流图', shortLabel: '河流', icon: 'carbon:area', color: '#0F766E' },
  { value: 'calendar', label: '日历坐标系', shortLabel: '日历', icon: 'carbon:calendar', color: '#0369A1' },
  { value: 'matrix', label: '矩阵坐标系', shortLabel: '矩阵', icon: 'carbon:grid', color: '#C2410C' },
  { value: 'chord', label: '和弦图', shortLabel: '和弦', icon: 'carbon:chart-relationship', color: '#7E22CE' },
]

export const DEFAULT_REPORT_CHART_TYPE: ReportChartType = 'line'

export function getReportChartTypeOption(type: ReportChartType): ReportChartTypeOption {
  return (
    REPORT_CHART_TYPE_OPTIONS.find((item) => item.value === type) ??
    REPORT_CHART_TYPE_OPTIONS[0]
  )
}

/** 将强调色转为浅底色 */
export function toChartTypeSoftBg(color: string, alpha = 0.12): string {
  const hex = color.replace('#', '')
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
