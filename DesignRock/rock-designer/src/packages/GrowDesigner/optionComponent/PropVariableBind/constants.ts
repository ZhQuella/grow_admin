/** 变量绑定配置 */

export const BIND_PREFIX = 'state.'

/** 函数体示例：须 return 返回绑定值 */
export const BIND_EXAMPLE_CODE = `// 直接绑定
return state.xxx

// 多行计算
const list = state.list || []
return list.filter((item) => item.enabled)

// 循环当前项: return state.item / return state.item.name
// 循环索引: return state.index`

export type VariableListItem = {
  key: string
  label: string
  expression: string
  describe?: string
}
