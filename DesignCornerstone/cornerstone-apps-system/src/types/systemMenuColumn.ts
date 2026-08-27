export const MENU_COLUMN_CODE_PATTERN = /^[A-Za-z0-9:_]+$/
export const MENU_COLUMN_CODE_MESSAGE = '仅允许大小写字母、数字、冒号和下划线'

export const COLUMN_TYPE_VALUES = ['string', 'number', 'person', 'dept', 'select', 'date', 'boolean', 'cascade'] as const
export type ColumnType = (typeof COLUMN_TYPE_VALUES)[number]

export const COLUMN_TYPE_OPTIONS: Array<{ label: string; value: ColumnType }> = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '人员', value: 'person' },
  { label: '部门', value: 'dept' },
  { label: '下拉框', value: 'select' },
  { label: '日期', value: 'date' },
  { label: '布尔', value: 'boolean' },
  { label: '级联', value: 'cascade' },
]

export function isColumnType(value: string): value is ColumnType {
  return (COLUMN_TYPE_VALUES as readonly string[]).includes(value)
}

export function columnTypeLabel(value: ColumnType | string | undefined) {
  return COLUMN_TYPE_OPTIONS.find((item) => item.value === value)?.label || '字符串'
}

export type SystemMenuTable = {
  code: string
  title: string
}

export type SystemMenuColumn = {
  id: string
  menuName: string
  tableCode: string
  tableTitle: string
  title: string
  code: string
  columnType: ColumnType
  enabled: boolean
}

export type SystemMenuColumnBundle = {
  tables: SystemMenuTable[]
  items: SystemMenuColumn[]
}

export type SystemMenuColumnSavePayload = {
  menuName: string
  tables: SystemMenuTable[]
  items: Array<{
    id?: string
    tableCode: string
    title: string
    code: string
    columnType: ColumnType
    enabled: boolean
  }>
}
