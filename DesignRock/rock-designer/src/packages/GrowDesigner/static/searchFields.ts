/** 高级搜索字段：设计器编辑用类型与控件白名单 */

export type SearchFieldElType =
  | 'GrowInput'
  | 'GrowInputNumber'
  | 'GrowSelect'
  | 'GrowCascader'
  | 'GrowTimePicker'
  | 'GrowDatePicker'
  | 'GrowTreeSelect'

export type SearchFieldBindModes = {
  options?: string
  data?: string
  loading?: string
  'remote-method'?: string
  remoteMethod?: string
}

/** 设计器 draft / 持久化字段（确认后去掉 id） */
export type DesignerSearchField = {
  id: string
  labelText: string
  model: string
  elType: SearchFieldElType
  placeholder?: string
  isDefault?: boolean
  noDelete?: boolean
  clearable?: boolean
  /** Select / Cascader / TreeSelect 选项或树数据 */
  options?: Array<Record<string, unknown>> | string | null
  data?: Array<Record<string, unknown>> | string | null
  label?: string
  value?: string
  multiple?: boolean
  filterable?: boolean
  remote?: boolean
  'remote-method'?: string | null
  remoteMethod?: string | null
  loading?: boolean | string | null
  /** InputNumber */
  min?: number | null
  max?: number | null
  /** DatePicker / TimePicker */
  type?: string
  format?: string
  'value-format'?: string
  valueFormat?: string
  /** Cascader */
  'show-all-levels'?: boolean
  /** TreeSelect */
  checkable?: boolean
  'key-field'?: string
  'label-field'?: string
  'children-field'?: string
  keyField?: string
  labelField?: string
  childrenField?: string
  /** 字段内绑定模式，运行时解析用；透传前会剥离 */
  _bindModes?: SearchFieldBindModes
  [key: string]: unknown
}

export const SEARCH_FIELD_EL_TYPE_OPTIONS: Array<{
  label: string
  value: SearchFieldElType
}> = [
  { label: '输入框', value: 'GrowInput' },
  { label: '数字输入框', value: 'GrowInputNumber' },
  { label: '选择器', value: 'GrowSelect' },
  { label: '级联选择器', value: 'GrowCascader' },
  { label: '时间选择器', value: 'GrowTimePicker' },
  { label: '日期选择器', value: 'GrowDatePicker' },
  { label: '树形选择', value: 'GrowTreeSelect' },
]

export const SEARCH_FIELD_EL_TYPE_LABEL: Record<SearchFieldElType, string> = {
  GrowInput: '输入框',
  GrowInputNumber: '数字输入框',
  GrowSelect: '选择器',
  GrowCascader: '级联选择器',
  GrowTimePicker: '时间选择器',
  GrowDatePicker: '日期选择器',
  GrowTreeSelect: '树形选择',
}

/** 需要选项 / 树数据的控件 */
export const SEARCH_FIELD_OPTIONS_TYPES = new Set<SearchFieldElType>([
  'GrowSelect',
  'GrowCascader',
  'GrowTreeSelect',
])

export const DATE_PICKER_TYPE_OPTIONS = [
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '日期范围', value: 'daterange' },
  { label: '日期时间范围', value: 'datetimerange' },
]

/** 持久化到 props.search 时剥离的编辑器字段 */
export const SEARCH_FIELD_EDITOR_KEYS = new Set(['id'])
