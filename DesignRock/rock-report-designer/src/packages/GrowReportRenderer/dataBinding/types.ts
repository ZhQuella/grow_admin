/** 报表区块数据绑定（对齐页面 state，按 series 下标绑定） */

export type ReportDataBindMode = 'bind' | 'map' | 'code'

/**
 * 单路数据绑定：
 * - bind：快捷绑定，source 可为 state.xxx 或简短表达式
 * - map：对 source 求值后，用 mapping.path / mapping.fields 提取
 * - code：JS 函数体（须 return），可用 state，结果直接作为目标数据
 */
export type ReportDataBindRef = {
  mode?: ReportDataBindMode
  /** 绑定来源：路径 / 表达式 / 函数体（code 模式须 return） */
  source?: string
  /**
   * map 模式：
   * - path: 从对象取字段，如 list / data.rows
   * - fields: 对象数组时取多列，如 ['name','value']
   */
  mapping?: {
    path?: string
    fields?: string[]
  }
}

/** 区块数据绑定配置 */
export type ReportBlockDataBinding = {
  /** 类目轴 / X 轴 data */
  xAxisData?: ReportDataBindRef
  /** Y 轴类目 data（热力等） */
  yAxisData?: ReportDataBindRef
  /**
   * 按 seriesList 下标逐项绑定
   * seriesData[i] → seriesList[i].data
   */
  seriesData?: ReportDataBindRef[]
  /**
   * 非直角坐标：整图数据（雷达 / 漏斗 / 地图等）
   * 求值结果注入系列 data（或 graph 的 { data, links }）
   */
  chartData?: ReportDataBindRef
  /** 雷达指示器（可选，覆盖 chartConfig.radar.indicator） */
  radarIndicator?: ReportDataBindRef
}
