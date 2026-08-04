import { nanoid } from 'nanoid'
import { deepCloneDesigner } from '@grow-admin-rock/utils'
import {
  SEARCH_FIELD_EDITOR_KEYS,
  SEARCH_FIELD_EL_TYPE_OPTIONS,
  SEARCH_FIELD_OPTIONS_TYPES,
  type DesignerSearchField,
  type SearchFieldElType,
} from './searchFields'

const isElType = (value: unknown): value is SearchFieldElType =>
  SEARCH_FIELD_EL_TYPE_OPTIONS.some((item) => item.value === value)

const applyOptionsDefaults = (
  field: DesignerSearchField,
  partial?: Partial<DesignerSearchField>,
) => {
  field.options = partial?.options !== undefined ? partial.options : []
  field.filterable = partial?.filterable ?? false
  field.multiple = partial?.multiple ?? false

  if (field.elType === 'GrowSelect') {
    field.label = partial?.label || 'label'
    field.value = partial?.value || 'value'
    field.remote = partial?.remote ?? false
    if (partial?.['remote-method'] != null || partial?.remoteMethod != null) {
      field['remote-method'] =
        (partial['remote-method'] as string) ?? (partial.remoteMethod as string)
    }
    if (partial?.loading != null) field.loading = partial.loading
  }

  if (field.elType === 'GrowCascader') {
    field['show-all-levels'] = partial?.['show-all-levels'] ?? true
  }

  if (field.elType === 'GrowTreeSelect') {
    field['key-field'] = partial?.['key-field'] || partial?.keyField || 'key'
    field['label-field'] = partial?.['label-field'] || partial?.labelField || 'label'
    field['children-field'] =
      partial?.['children-field'] || partial?.childrenField || 'children'
    if (partial?.data !== undefined) field.data = partial.data
  }
}

export const createSearchField = (
  partial?: Partial<DesignerSearchField>,
): DesignerSearchField => {
  const elType = isElType(partial?.elType) ? partial.elType : 'GrowInput'
  const model =
    String(partial?.model ?? '').trim() || `field_${nanoid(6)}`
  const field: DesignerSearchField = {
    id: partial?.id || nanoid(),
    labelText: partial?.labelText ?? '新字段',
    model,
    elType,
    placeholder: partial?.placeholder ?? '',
    isDefault: partial?.isDefault ?? true,
    noDelete: partial?.noDelete ?? false,
    clearable: partial?.clearable ?? true,
  }

  if (SEARCH_FIELD_OPTIONS_TYPES.has(elType)) {
    applyOptionsDefaults(field, partial)
  }

  if (elType === 'GrowInputNumber') {
    if (partial?.min !== undefined) field.min = partial.min
    if (partial?.max !== undefined) field.max = partial.max
  }

  if (elType === 'GrowDatePicker') {
    field.type = partial?.type || 'date'
    field['value-format'] =
      partial?.['value-format'] || partial?.valueFormat || 'YYYY-MM-DD'
  }

  if (elType === 'GrowTimePicker') {
    field.format = partial?.format || 'HH:mm:ss'
    field['value-format'] =
      partial?.['value-format'] || partial?.valueFormat || partial?.format || 'HH:mm:ss'
  }

  if (partial?._bindModes) {
    field._bindModes = { ...partial._bindModes }
  }

  return field
}

/** 拖入默认示例（与 dropDefaults 对齐） */
export const createDefaultSearchFields = (): DesignerSearchField[] => [
  createSearchField({
    labelText: '关键词',
    placeholder: '请输入关键词',
    elType: 'GrowInput',
    isDefault: true,
    model: 'keyword',
    noDelete: true,
  }),
  createSearchField({
    labelText: '状态',
    elType: 'GrowSelect',
    isDefault: true,
    model: 'status',
    label: 'label',
    value: 'value',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  }),
]

/** 读入编辑器：补 id，规范化 elType */
export const toDesignerSearchFields = (
  list: unknown,
): DesignerSearchField[] => {
  if (!Array.isArray(list)) return []
  return list.map((item) => {
    if (!item || typeof item !== 'object') {
      return createSearchField()
    }
    const raw = item as Record<string, unknown>
    return createSearchField({
      ...(raw as Partial<DesignerSearchField>),
      id: String(raw.id || nanoid()),
      elType: isElType(raw.elType) ? raw.elType : 'GrowInput',
      model: String(raw.model ?? ''),
      labelText: String(raw.labelText ?? ''),
    })
  })
}

/** 写出 props.search：去掉编辑器 id，保留 _bindModes */
export const toPersistedSearchFields = (
  list: DesignerSearchField[],
): Record<string, unknown>[] =>
  list.map((field) => {
    const next: Record<string, unknown> = { ...deepCloneDesigner(field) }
    for (const key of SEARCH_FIELD_EDITOR_KEYS) {
      Reflect.deleteProperty(next, key)
    }
    // 空 remote-method 不落库
    if (!String(next['remote-method'] ?? next.remoteMethod ?? '').trim()) {
      Reflect.deleteProperty(next, 'remote-method')
      Reflect.deleteProperty(next, 'remoteMethod')
    }
    if (!next._bindModes || !Object.keys(next._bindModes as object).length) {
      Reflect.deleteProperty(next, '_bindModes')
    }
    return next
  })

export const cloneSearchFields = (
  list: DesignerSearchField[],
): DesignerSearchField[] => deepCloneDesigner(list) as DesignerSearchField[]

export const updateSearchFieldById = (
  list: DesignerSearchField[],
  next: DesignerSearchField,
): DesignerSearchField[] =>
  list.map((item) => (item.id === next.id ? { ...next } : item))

export const removeSearchFieldById = (
  list: DesignerSearchField[],
  id: string,
): DesignerSearchField[] => list.filter((item) => item.id !== id)

const copyOptionsIfPresent = (
  from: DesignerSearchField,
  to: DesignerSearchField,
) => {
  if (Array.isArray(from.options)) {
    to.options = from.options
  } else if (typeof from.options === 'string' && from.options.trim()) {
    to.options = from.options
    to._bindModes = {
      ...(from._bindModes || {}),
      options: from._bindModes?.options || 'bind',
    }
  }
  if (from.data !== undefined) {
    to.data = from.data
    if (typeof from.data === 'string' && from.data.trim()) {
      to._bindModes = {
        ...(to._bindModes || {}),
        ...(from._bindModes || {}),
        data: from._bindModes?.data || 'bind',
      }
    }
  }
}

/** 切换控件类型时清理无关字段，保留公共信息 */
export const switchSearchFieldElType = (
  field: DesignerSearchField,
  elType: SearchFieldElType,
): DesignerSearchField => {
  const base = createSearchField({
    id: field.id,
    labelText: field.labelText,
    model: field.model,
    placeholder: field.placeholder,
    isDefault: field.isDefault,
    noDelete: field.noDelete,
    clearable: field.clearable,
    elType,
  })
  if (SEARCH_FIELD_OPTIONS_TYPES.has(elType)) {
    copyOptionsIfPresent(field, base)
    if (elType === 'GrowSelect') {
      base.label = field.label || 'label'
      base.value = field.value || 'value'
    }
  }
  return base
}
