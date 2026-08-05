import {
  createConfig,
  textInput,
  variableBindOnlyInput,
} from './shared'

/** 循环：按数据源列表重复渲染子节点 */
export const loopConfig = createConfig([
  variableBindOnlyInput(
    '数据源',
    'data',
    '循环列表，仅支持变量绑定（如 state.list），需为数组；子节点通过 state.item 访问当前项',
    '请绑定数据源',
  ),
  textInput('项变量名', 'itemKey', '子节点绑定路径前缀，默认 item → state.item'),
  textInput('索引变量名', 'indexKey', '子节点绑定路径前缀，默认 index → state.index'),
])

/** 判断：条件为真时渲染子节点（与循环「数据源」同一套输入 + 变量绑定） */
export const conditionConfig = createConfig([
  variableBindOnlyInput(
    '条件',
    'when',
    '为真时渲染子节点，仅支持变量绑定（如 state.visible）',
    '请绑定条件',
  ),
])
