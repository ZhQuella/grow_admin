import {
  EDIT_SCOPE_VALUES,
  FILTER_OPERATOR_OPTIONS,
  FILTER_OPERATOR_VALUES,
  VIEW_OTHER_VALUES,
  editScopeLabel,
  filterOperatorLabel,
  filterValueLabel,
  viewOtherLabel,
  type EditScope,
  type FilterOperator,
  type RowFilterCondition,
  type SelfRelatedConfig,
  type ViewOtherScope,
} from '../../../types/systemRole'
import type { ColumnType } from '../../../types/systemMenuColumn'

export { editScopeLabel, filterOperatorLabel, filterValueLabel, viewOtherLabel }

export function emptySelfRelated(): SelfRelatedConfig {
  return {
    createdBySelf: true,
    fieldContainsSelf: false,
    columnIds: [],
  }
}

export function emptyFilterCondition(): RowFilterCondition {
  return {
    id: `rf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    columnId: '',
    operator: 'eq',
    value: [],
  }
}

export function summarizeSelfRelated(config: SelfRelatedConfig | undefined, columnTitle: (id: string) => string) {
  if (!config) return ''
  const parts: string[] = []
  if (config.createdBySelf) parts.push('成员本人创建的记录')
  if (config.fieldContainsSelf) {
    const names = (config.columnIds || []).map(columnTitle).filter(Boolean)
    parts.push(names.length ? `字段包含成员本人（${names.join('、')}）` : '字段包含成员本人')
  }
  return parts.join('；') || '-'
}

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function parseCheckedPermKeys(keys: string[]) {
  const menuNames: string[] = []
  const functionIds: string[] = []
  for (const key of keys) {
    if (key.startsWith('menu:')) menuNames.push(key.slice(5))
    if (key.startsWith('fn:')) functionIds.push(key.slice(3))
  }
  return { menuNames, functionIds }
}

export function toCheckedPermKeys(menuNames: string[], functionIds: string[]) {
  return [
    ...menuNames.map((name) => `menu:${name}`),
    ...functionIds.map((id) => `fn:${id}`),
  ]
}

export function isEditScope(value: string): value is EditScope {
  return (EDIT_SCOPE_VALUES as readonly string[]).includes(value)
}

export function isViewOther(value: string): value is ViewOtherScope {
  return (VIEW_OTHER_VALUES as readonly string[]).includes(value)
}

export function isFilterOperator(value: string): value is FilterOperator {
  return (FILTER_OPERATOR_VALUES as readonly string[]).includes(value)
}

export function operatorsForColumnType(type?: ColumnType | string) {
  const keys: FilterOperator[] = (
    type === 'number' || type === 'date'
      ? ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']
      : type === 'boolean'
        ? ['eq', 'neq']
        : ['eq', 'neq', 'contains', 'not_contains']
  )
  return FILTER_OPERATOR_OPTIONS.filter((item) => keys.includes(item.value))
}

export function pickCheckedKeys(arg1: unknown, arg2?: unknown): string[] {
  if (arg2 && typeof arg2 === 'object' && Array.isArray((arg2 as { checkedKeys?: unknown }).checkedKeys)) {
    return [...(arg2 as { checkedKeys: string[] }).checkedKeys]
  }
  if (Array.isArray(arg1)) return [...arg1]
  return []
}
