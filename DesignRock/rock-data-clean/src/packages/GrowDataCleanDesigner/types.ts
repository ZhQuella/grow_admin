/** 清洗流节点类别 */
export type CleanNodeCategory = 'source' | 'clean' | 'merge' | 'agg' | 'output'

/** 清洗流节点类型 */
export type CleanNodeType =
  | 'table'
  | 'api'
  | 'null-handle'
  | 'format'
  | 'dedupe'
  | 'trim-case'
  | 'outlier'
  | 'filter'
  | 'condition'
  | 'split-field'
  | 'join'
  | 'union'
  | 'groupby'
  | 'pivot'
  | 'output'

/** 数据表源的来源种类（建模表 / Dataset 原始表 / Dataset 输出） */
export type CleanTableSourceKind = 'schema-table' | 'dataset-table' | 'dataset-output'

export type CleanNodePosition = { x: number; y: number }

export type CleanTableSourceConfig = {
  sourceKind: CleanTableSourceKind
  /** 建模 id 或 dataset id */
  refId?: string
  refLabel?: string
  tableId?: string
  tableName?: string
  /** 勾选输出字段；`undefined`/`null` = 全部（默认）；`[]` = 不输出任何字段 */
  fields?: string[] | null
}

export type CleanApiSourceConfig = {
  url?: string
  method?: 'GET' | 'POST'
}

export type CleanNullHandleConfig = {
  fields?: string[]
  strategy?: 'fill' | 'drop-row' | 'ffill' | 'bfill'
  fillValue?: string
}

export type CleanFormatConfig = {
  field?: string
  format?: 'phone' | 'id-card' | 'date' | 'money' | 'regex'
  pattern?: string
}

export type CleanDedupeConfig = {
  fields?: string[]
  keep?: 'first' | 'last' | 'random'
}

export type CleanTrimCaseConfig = {
  fields?: string[]
  ops?: Array<'trim' | 'trim-all' | 'upper' | 'lower' | 'capitalize'>
}

export type CleanOutlierConfig = {
  field?: string
  rule?: 'range' | 'regex' | 'enum'
  action?: 'mark' | 'drop' | 'replace'
  replaceValue?: string
  /** rule=range */
  min?: string
  max?: string
  /** rule=regex */
  pattern?: string
  /** rule=enum，逗号分隔合法值 */
  enumValues?: string
}

export type CleanFilterCondition = {
  field: string
  op: string
  value: string
}

export type CleanFilterConfig = {
  logic?: 'and' | 'or'
  conditions?: CleanFilterCondition[]
}

/**
 * 条件分支：按条件把数据分流到「满足 / 不满足」两路输出。
 * 与「条件过滤」不同——过滤丢弃不满足的行；分支保留全部行但走不同下游。
 */
export type CleanConditionConfig = {
  logic?: 'and' | 'or'
  conditions?: CleanFilterCondition[]
}

/** 将一个字段拆分为多个字段 */
export type CleanSplitMode = 'delimiter' | 'regex' | 'fixed-width'

export type CleanSplitOutputField = {
  /** 输出字段名 */
  name: string
  /** 固定宽度模式下的截取长度；分隔/正则模式可忽略 */
  width?: number
}

export type CleanSplitFieldConfig = {
  /** 源字段 */
  field?: string
  /** 拆分方式 */
  mode?: CleanSplitMode
  /** 分隔符（mode=delimiter），如 `,` / `|` / 空格 */
  delimiter?: string
  /** 正则捕获组（mode=regex），需含分组，如 `^(\\d{4})-(\\d{2})-(\\d{2})$` */
  pattern?: string
  /** 输出字段定义（顺序对应拆分段） */
  outputs?: CleanSplitOutputField[]
  /** 是否保留原字段，默认 true */
  keepOriginal?: boolean
  /** 段数不足时是否用空值补齐，默认 true */
  padEmpty?: boolean
}

export type CleanJoinConfig = {
  joinType?: 'left' | 'inner' | 'right' | 'full'
  keys?: Array<{ leftField: string; rightField: string }>
  outputFields?: string[]
}

export type CleanUnionConfig = {
  dedupe?: boolean
  fieldMap?: Record<string, string>
}

export type CleanGroupByMetric = {
  field: string
  fn: 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN'
  alias: string
}

export type CleanGroupByConfig = {
  groupFields?: string[]
  metrics?: CleanGroupByMetric[]
}

export type CleanPivotConfig = {
  rowField?: string
  colField?: string
  valueField?: string
  agg?: 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN'
}

export type CleanOutputConfig = {
  outputName?: string
  target?: 'report' | 'lowcode' | 'api'
  trigger?: 'on-demand' | 'manual-preview'
  consumers?: Array<{ id: string; name: string; kind: 'report' | 'page' }>
  /**
   * 最终输出字段（有序）。
   * `undefined`/`null` = 上游全部（默认）；`[]` = 不输出任何字段。
   */
  fields?: string[] | null
}

export type CleanNodeConfigMap = {
  table: CleanTableSourceConfig
  api: CleanApiSourceConfig
  'null-handle': CleanNullHandleConfig
  format: CleanFormatConfig
  dedupe: CleanDedupeConfig
  'trim-case': CleanTrimCaseConfig
  outlier: CleanOutlierConfig
  filter: CleanFilterConfig
  condition: CleanConditionConfig
  'split-field': CleanSplitFieldConfig
  join: CleanJoinConfig
  union: CleanUnionConfig
  groupby: CleanGroupByConfig
  pivot: CleanPivotConfig
  output: CleanOutputConfig
}

export type CleanFlowNode<T extends CleanNodeType = CleanNodeType> = {
  id: string
  type: T
  name: string
  position: CleanNodePosition
  /** 预览统计（设计器本地采样，非运行时权威） */
  stats?: {
    inputRows?: number | null
    outputRows?: number | null
  }
  config: CleanNodeConfigMap[T]
}

export type CleanFlowEdge = {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

export type CleanFlowStatus = 'draft' | 'published'

/** 清洗流定义（声明式；调用时执行） */
export type CleanFlow = {
  version: 1
  id: string
  name: string
  status: CleanFlowStatus
  nodes: CleanFlowNode[]
  edges: CleanFlowEdge[]
  updatedAt?: string
}

export type CleanPreviewColumn = {
  key: string
  title: string
  dataType?: string
}

export type CleanPreviewResult = {
  columns: CleanPreviewColumn[]
  rows: Record<string, unknown>[]
  /** 未实现节点 / 配置问题等提示（不阻断预览） */
  warnings?: string[]
  /** 致命错误（无目标节点、多 output 等） */
  error?: string
  targetNodeId?: string
  targetNodeName?: string
}

/** 组件库条目 */
export type CleanPaletteItem = {
  type: CleanNodeType
  category: CleanNodeCategory
  label: string
  icon: string
  description?: string
  /** M1 仅展示；false 表示后续版本 */
  enabled?: boolean
}

export type CleanPaletteGroup = {
  category: CleanNodeCategory
  label: string
  items: CleanPaletteItem[]
}
