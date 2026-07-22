/** 设计器表格列（统一 title/field，渲染时映射为 label/prop） */

export type TableColumnAlign = 'left' | 'center' | 'right'
export type TableColumnFixed = boolean | 'left' | 'right'
/** 特殊列：勾选 / 序号（对应 el-table-column type） */
export type TableColumnSpecialType = 'selection' | 'index'

export type DesignerTableColumn = {
  id: string
  /** 特殊列类型；空为普通数据列 */
  type?: TableColumnSpecialType | ''
  /** 表头文案 → el-table-column label */
  title: string
  /** 字段名 → el-table-column prop（分组列 / 特殊列可空） */
  field?: string
  width?: string | number
  minWidth?: string | number
  align?: TableColumnAlign | ''
  headerAlign?: TableColumnAlign | ''
  fixed?: TableColumnFixed | ''
  sortable?: boolean | 'custom' | ''
  resizable?: boolean
  showOverflowTooltip?: boolean
  className?: string
  labelClassName?: string
  columnKey?: string
  /** 是否显示，默认 true */
  visible?: boolean
  children?: DesignerTableColumn[]
}

export const isSpecialTableColumn = (
  col?: Pick<DesignerTableColumn, 'type'> | null,
): col is DesignerTableColumn & { type: TableColumnSpecialType } =>
  col?.type === 'selection' || col?.type === 'index'

export const TABLE_COLUMN_SPECIAL_LABEL: Record<TableColumnSpecialType, string> = {
  selection: '勾选',
  index: '序号',
}

/** ElOption 空字符串 value 异常，用占位后再映射回 '' */
export const TABLE_COLUMN_OPTION_NONE = '__none__'

export const TABLE_COLUMN_ALIGN_OPTIONS = [
  { label: '默认', value: TABLE_COLUMN_OPTION_NONE },
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
]

export const TABLE_COLUMN_FIXED_OPTIONS = [
  { label: '不固定', value: TABLE_COLUMN_OPTION_NONE },
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
]

export const TABLE_COLUMN_SORTABLE_OPTIONS = [
  { label: '否', value: TABLE_COLUMN_OPTION_NONE },
  { label: '是', value: 'true' },
  { label: '自定义', value: 'custom' },
]
