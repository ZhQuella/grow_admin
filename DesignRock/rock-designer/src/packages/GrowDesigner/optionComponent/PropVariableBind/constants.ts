/** 变量绑定配置 */

import { DATA_EXAMPLE_CODE } from '../../components/shared/dataExample'

export const BIND_PREFIX = 'state.'

/** 与数据源示例一致，并补充数据源引用写法 */
export const BIND_EXAMPLE_CODE = `数据源: state.xxx
${DATA_EXAMPLE_CODE}`

export type VariableListItem = {
  key: string
  label: string
  expression: string
  describe?: string
}
