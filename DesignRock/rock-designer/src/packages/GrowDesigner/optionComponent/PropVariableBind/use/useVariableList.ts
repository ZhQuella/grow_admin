import { computed, type Ref } from 'vue'
import { BIND_PREFIX, type VariableListItem } from '../constants'
import type { DesignerDataSourceItem } from '../../../components/dataSource/types'

/** 将「数据源」列表项映射为可绑定变量 */
export const mapDataSourceToVariables = (
  list: DesignerDataSourceItem[] = [],
): VariableListItem[] =>
  list
    .filter((item) => item && String(item.name || '').trim())
    .map((item) => {
      const name = String(item.name).trim()
      return {
        key: item.id || name,
        label: name,
        describe: item.description || '',
        expression: `${BIND_PREFIX}${name}`,
      }
    })

/** 变量列表：数据来自设计器「数据源」 */
export const useVariableList = (
  sourceList: Ref<DesignerDataSourceItem[]>,
  keyword: Ref<string>,
) => {
  const allVariables = computed(() => mapDataSourceToVariables(sourceList.value))

  const filteredVariables = computed(() => {
    const q = keyword.value.trim().toLowerCase()
    if (!q) return allVariables.value
    return allVariables.value.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.expression.toLowerCase().includes(q) ||
        (item.describe || '').toLowerCase().includes(q),
    )
  })

  return { allVariables, filteredVariables }
}

/** 点击变量：若当前为空则写入，否则追加 */
export const insertVariableExpression = (current: string, expression: string) => {
  const trimmed = (current || '').trim()
  if (!trimmed) return expression
  return `${trimmed}${expression}`
}
