import type {
  CleanNodeCategory,
  CleanNodeType,
  CleanPaletteGroup,
  CleanSplitMode,
  CleanTableSourceKind,
} from '../types'
import { DEMO_CLEAN_SCHEMA_TABLE_OPTIONS } from './demoTables'

export const CATEGORY_META: Record<
  CleanNodeCategory,
  { label: string; cssVar: string }
> = {
  source: { label: '数据源', cssVar: '--clean-cat-source' },
  clean: { label: '清洗', cssVar: '--clean-cat-clean' },
  merge: { label: '合并', cssVar: '--clean-cat-merge' },
  agg: { label: '聚合', cssVar: '--clean-cat-agg' },
  output: { label: '输出', cssVar: '--clean-cat-output' },
}

export const NODE_TYPE_META: Record<
  CleanNodeType,
  {
    label: string
    category: CleanNodeCategory
    icon: string
    description: string
    /** 输入端口：默认 1；join=2；output 仍有输入；source=0 */
    inputs: number
    outputs: number
    enabled: boolean
  }
> = {
  table: {
    label: '数据表',
    category: 'source',
    icon: 'carbon:data-table',
    description: '从建模或数据准备选择表/输出',
    inputs: 0,
    outputs: 1,
    enabled: true,
  },
  api: {
    label: 'API 接口',
    category: 'source',
    icon: 'carbon:api',
    description: '从 HTTP 接口拉取数据',
    inputs: 0,
    outputs: 1,
    enabled: true,
  },
  'null-handle': {
    label: '空值处理',
    category: 'clean',
    icon: 'carbon:warning-alt',
    description: '填充 / 删除 / 前后向填充',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  format: {
    label: '格式标准化',
    category: 'clean',
    icon: 'carbon:text-font',
    description: '手机号 / 日期 / 金额等格式',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  dedupe: {
    label: '去重',
    category: 'clean',
    icon: 'carbon:filter-remove',
    description: '按字段组合去重',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'trim-case': {
    label: '去空格&大小写',
    category: 'clean',
    icon: 'carbon:text-mining',
    description: '空格与大小写规范化',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  outlier: {
    label: '异常值处理',
    category: 'clean',
    icon: 'carbon:warning-hex',
    description: '范围 / 正则 / 枚举校验',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  filter: {
    label: '条件过滤',
    category: 'clean',
    icon: 'carbon:filter',
    description: '按条件过滤行（丢弃不满足的行）',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  condition: {
    label: '条件分支',
    category: 'clean',
    icon: 'carbon:flow',
    description: '按条件分流到「满足 / 不满足」两路',
    inputs: 1,
    outputs: 2,
    enabled: true,
  },
  'split-field': {
    label: '字段拆分',
    category: 'clean',
    icon: 'carbon:split-screen',
    description: '将一个字段拆分为多个字段',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  join: {
    label: '关联合并',
    category: 'merge',
    icon: 'carbon:data-enrichment',
    description: 'LEFT / INNER / RIGHT / FULL JOIN',
    inputs: 2,
    outputs: 1,
    enabled: true,
  },
  union: {
    label: '纵向合并',
    category: 'merge',
    icon: 'carbon:list',
    description: 'UNION 多路输入',
    inputs: 2,
    outputs: 1,
    enabled: true,
  },
  groupby: {
    label: '分组聚合',
    category: 'agg',
    icon: 'carbon:chart-average',
    description: 'GROUP BY + 聚合度量',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  pivot: {
    label: '透视表',
    category: 'agg',
    icon: 'carbon:chart-treemap',
    description: '行/列维度透视',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  output: {
    label: '数据输出',
    category: 'output',
    icon: 'carbon:data-share',
    description: '流终点，供报表/页面调用时执行',
    inputs: 1,
    outputs: 0,
    enabled: true,
  },
}

export const PALETTE_GROUPS: CleanPaletteGroup[] = (
  ['source', 'clean', 'merge', 'agg', 'output'] as CleanNodeCategory[]
).map((category) => ({
  category,
  label: CATEGORY_META[category].label,
  items: (Object.keys(NODE_TYPE_META) as CleanNodeType[])
    .filter((type) => NODE_TYPE_META[type].category === category)
    .map((type) => {
      const meta = NODE_TYPE_META[type]
      return {
        type,
        category,
        label: meta.label,
        icon: meta.icon,
        description: meta.description,
        enabled: meta.enabled,
      }
    }),
}))

export const FILTER_OP_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'not-contains' },
  { label: '为空', value: 'empty' },
  { label: '不为空', value: 'not-empty' },
]

export const FILTER_LOGIC_OPTIONS: Array<{ label: string; value: 'and' | 'or' }> = [
  { label: '且 (AND)', value: 'and' },
  { label: '或 (OR)', value: 'or' },
]

export const SPLIT_MODE_OPTIONS: Array<{ label: string; value: CleanSplitMode }> = [
  { label: '分隔符', value: 'delimiter' },
  { label: '正则捕获', value: 'regex' },
  { label: '固定宽度', value: 'fixed-width' },
]

export const TABLE_SOURCE_KIND_OPTIONS: Array<{
  label: string
  value: CleanTableSourceKind
}> = [
  { label: '建模表', value: 'schema-table' },
  { label: 'Dataset 原始表', value: 'dataset-table' },
  { label: 'Dataset 输出', value: 'dataset-output' },
]

/** M1 demo：可选数据源列表（schema-table 与清洗专用 Mock 对齐） */
export const DEMO_SOURCE_OPTIONS = {
  'schema-table': DEMO_CLEAN_SCHEMA_TABLE_OPTIONS,
  'dataset-table': [
    {
      id: 'ds_sales::orders',
      label: '销售数据集 · orders（原始表）',
      tableName: 'orders',
    },
    {
      id: 'ds_sales::customers',
      label: '销售数据集 · customers（原始表）',
      tableName: 'customers',
    },
  ],
  'dataset-output': [
    { id: 'ds_sales::output', label: '销售数据集 · 查询输出', tableName: 'dataset_output' },
  ],
}
