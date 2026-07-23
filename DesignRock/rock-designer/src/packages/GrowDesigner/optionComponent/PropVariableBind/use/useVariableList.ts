import { computed, type Ref } from 'vue'
import { BIND_PREFIX, type VariableListItem } from '../constants'
import type { DesignerDataSourceItem } from '../../../components/dataSource/types'
import type { LoopScopeInfo } from '../../../static/loopScope'

/** 将「数据源」列表项映射为可绑定变量（仅顶层，避免对象属性展开导致列表杂乱） */
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

/** 循环作用域变量：state.item / state.index（支持自定义键名） */
export const mapLoopScopesToVariables = (
  scopes: LoopScopeInfo[] = [],
): VariableListItem[] => {
  const result: VariableListItem[] = []
  const seen = new Set<string>()
  scopes.forEach((scope, index) => {
    const layer = scopes.length > 1 ? `（第 ${scopes.length - index} 层）` : ''
    const itemExpr = `${BIND_PREFIX}${scope.itemKey}`
    const indexExpr = `${BIND_PREFIX}${scope.indexKey}`
    if (!seen.has(itemExpr)) {
      seen.add(itemExpr)
      result.push({
        key: `loop-item:${scope.uuid}:${scope.itemKey}`,
        label: `${scope.itemKey}${layer}`,
        describe: '循环当前项，可写 state.item.字段名',
        expression: itemExpr,
      })
    }
    if (!seen.has(indexExpr)) {
      seen.add(indexExpr)
      result.push({
        key: `loop-index:${scope.uuid}:${scope.indexKey}`,
        label: `${scope.indexKey}${layer}`,
        describe: '循环当前索引（从 0 开始）',
        expression: indexExpr,
      })
    }
  })
  return result
}

/** 变量列表：数据源 + 当前节点所在循环作用域 */
export const useVariableList = (
  sourceList: Ref<DesignerDataSourceItem[]>,
  keyword: Ref<string>,
  loopScopes?: Ref<LoopScopeInfo[]>,
) => {
  const allVariables = computed(() => [
    ...mapLoopScopesToVariables(loopScopes?.value || []),
    ...mapDataSourceToVariables(sourceList.value),
  ])

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
