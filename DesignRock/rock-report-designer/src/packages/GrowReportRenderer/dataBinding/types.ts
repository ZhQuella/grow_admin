/** 报表区块数据绑定（对齐页面 state，按 series 下标绑定） */

export type ReportDataBindMode = 'bind' | 'map'

/**
 * 单路数据绑定：
 * - bind：source 函数体求值结果直接作为目标数据（如 return state.sales）
 * - map：对 source 求值后，用 mapping.path / mapping.fields 提取
 */
export type ReportDataBindRef = {
  mode?: ReportDataBindMode
  /** 绑定函数体，须 return；纯路径 state.xxx 亦可 */
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

/** 数据集绑定（笛卡尔图 Phase 1） */
export type ReportDatasetBinding = {
  datasetId: string
  /** 类目维度字段 id → xAxisData */
  categoryFieldId?: string
  /** 与 seriesList 下标对齐的度量字段 id */
  seriesFieldIds?: string[]
}

export type ReportDataBindingSourceMode = 'state' | 'dataset'

/** 区块数据绑定配置 */
export type ReportBlockDataBinding = {
  /** 数据来源：页面 state（默认）或数据准备 Dataset */
  sourceMode?: ReportDataBindingSourceMode
  /** sourceMode=dataset 时生效（本版仅笛卡尔图） */
  dataset?: ReportDatasetBinding
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
