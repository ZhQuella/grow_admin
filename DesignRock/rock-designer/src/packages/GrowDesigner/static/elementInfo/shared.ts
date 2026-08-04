/** 属性配置项公共类型与复用选项 */

import { registerFunctionPropParams } from '../functionPropParams'

export type PropConfigItem = {
  eleType: string
  name: string
  describe?: string
  modelKey: string
  props?: Record<string, any>
}

export type ElementInfoConfig = {
  props: PropConfigItem[]
  styles?: Record<string, any>
  events?: Record<string, any>
  renderArgument?: Record<string, any>
}

export const sizeOptions = [
  { label: '大', value: 'large' },
  { label: '默认', value: 'default' },
  { label: '小', value: 'small' },
]

export const boolSwitch = (name: string, modelKey: string, describe?: string): PropConfigItem => ({
  eleType: 'GrowSwitch',
  name,
  describe,
  modelKey,
})

export const textInput = (
  name: string,
  modelKey: string,
  describe?: string,
  placeholder?: string,
): PropConfigItem => ({
  eleType: 'GrowInput',
  name,
  describe,
  modelKey,
  props: {
    placeholder: placeholder || `请输入${name}`,
  },
})

export const numberInput = (
  name: string,
  modelKey: string,
  describe?: string,
  placeholder?: string,
): PropConfigItem => ({
  eleType: 'GrowInputNumber',
  name,
  describe,
  modelKey,
  props: {
    controls: false,
    placeholder: placeholder || `请输入${name}`,
  },
})

export const selectInput = (
  name: string,
  modelKey: string,
  options: Array<{ label: string; value: any }>,
  describe?: string,
  placeholder?: string,
): PropConfigItem => ({
  eleType: 'GrowSelect',
  name,
  describe,
  modelKey,
  props: {
    placeholder: placeholder || `请选择${name}`,
    options,
  },
})

export const sizeSelect = (describe = '组件尺寸'): PropConfigItem =>
  selectInput('尺寸', 'size', sizeOptions, describe)

/** 容器子项名称管理（Tabs / Collapse 等） */
export const childPaneNames = (
  name: string,
  options: {
    childName: string
    titleKey?: string
    nameKey?: string
    activeKey?: string
    titlePrefix?: string
  },
  describe?: string,
): PropConfigItem => ({
  eleType: 'ChildPaneNames',
  name,
  describe,
  modelKey: '__childPaneNames__',
  props: {
    titleKey: options.titleKey || 'label',
    nameKey: options.nameKey || 'name',
    activeKey: options.activeKey || 'modelValue',
    childName: options.childName,
    titlePrefix: options.titlePrefix || '选项',
  },
})

/** 弹性盒子 Col 栅格管理 */
export const childColSpans = (
  name: string,
  options?: {
    childName?: string
    defaultSpan?: number
  },
  describe?: string,
): PropConfigItem => ({
  eleType: 'ChildColSpans',
  name,
  describe,
  modelKey: '__childColSpans__',
  props: {
    childName: options?.childName || 'GrowCol',
    defaultSpan: options?.defaultSpan ?? 12,
  },
})

export const dimensionInput = (
  name: string,
  modelKey: string,
  options?: {
    units?: Array<{ label: string; value: string }>
    defaultUnit?: string
    placeholder?: string
  },
  describe?: string,
): PropConfigItem => ({
  eleType: 'PropDimensionInput',
  name,
  describe,
  modelKey,
  props: {
    units: options?.units ?? [
      { label: 'px', value: 'px' },
      { label: '%', value: '%' },
      { label: 'vh', value: 'vh' },
    ],
    defaultUnit: options?.defaultUnit ?? 'px',
    placeholder: options?.placeholder ?? `请输入${name}`,
  },
})

/** 可输入 + 变量绑定（加号弹出绑定弹窗） */
export const variableBindInput = (
  name: string,
  modelKey: string,
  describe?: string,
  placeholder?: string,
  options?: { bindOnly?: boolean },
): PropConfigItem => ({
  eleType: 'PropVariableBind',
  name,
  describe,
  modelKey,
  props: {
    placeholder:
      placeholder ||
      (options?.bindOnly ? `请绑定${name}` : `请输入${name}或绑定变量`),
    bindOnly: Boolean(options?.bindOnly),
  },
})

/** 仅变量绑定（不可手输文本） */
export const variableBindOnlyInput = (
  name: string,
  modelKey: string,
  describe?: string,
  placeholder?: string,
): PropConfigItem =>
  variableBindInput(name, modelKey, describe, placeholder, { bindOnly: true })

/** 表单字段 model 绑定（如 user.name），支持变量 */
export const modelBind = (
  describe = '表单字段 model 绑定，支持变量绑定',
  modelKey = 'model',
): PropConfigItem =>
  variableBindInput('model', modelKey, describe, '请输入 model 或绑定变量')

/** 组件默认值（绑定到 modelValue，支持变量） */
export const defaultValueBind = (
  describe = '组件初始默认值，支持变量绑定',
  modelKey = 'modelValue',
): PropConfigItem =>
  variableBindInput('默认值', modelKey, describe, '请输入默认值或绑定变量')

/** Switch + 变量绑定（显示 / 渲染等布尔控制） */
export const switchVariableBind = (
  name: string,
  modelKey: string,
  describe?: string,
): PropConfigItem => ({
  eleType: 'PropSwitchBind',
  name,
  describe,
  modelKey,
  props: {
    defaultValue: true,
  },
})

/** 所有组件通用：显示（v-show）/ 渲染（v-if） */
export const COMMON_VISIBILITY_PROPS: PropConfigItem[] = [
  switchVariableBind(
    '显示',
    'visible',
    '控制是否显示，对应 v-show（不显示时仍会渲染，仅隐藏）',
  ),
  switchVariableBind(
    '渲染',
    'render',
    '控制是否渲染，对应 v-if（不渲染时不创建节点）',
  ),
]

/** 表格多级表头配置 */
export const tableColumnsInput = (
  name = '表头',
  describe = '配置表格列，支持多级表头、排序与常用列属性；也可绑定变量（EP columns 数组）',
): PropConfigItem => ({
  eleType: 'PropTableColumns',
  name,
  describe,
  modelKey: 'columns',
})

/** ColumnBar 列配置：关联数据源或关联表格表头 */
export const columnBarColumnsInput = (
  name = '列配置',
  describe = '关联数据源或选择画布表格表头作为列设置数据',
): PropConfigItem => ({
  eleType: 'PropColumnBarColumns',
  name,
  describe,
  modelKey: '__columnBarColumns__',
})

/** 高级搜索字段配置 */
export const searchFieldsInput = (
  name = '搜索字段',
  describe = '配置高级搜索条件字段（控件类型、options、远程搜索等）；也可整体绑定变量',
): PropConfigItem => ({
  eleType: 'PropSearchFields',
  name,
  describe,
  modelKey: 'search',
})

/** 走马灯轮播项配置 */
export const carouselItemsInput = (
  name = '轮播项',
  describe = '配置走马灯每一项的图片、跳转地址与打开方式',
): PropConfigItem => ({
  eleType: 'PropCarouselItems',
  name,
  describe,
  modelKey: '__carouselItems__',
})

/** 分页 layout：勾选 + 拖拽排序 */
export const paginationLayoutInput = (
  name = '布局',
  describe = '勾选并拖拽排序分页子组件：total / sizes / prev / pager / next / jumper / ->',
): PropConfigItem => ({
  eleType: 'PropPaginationLayout',
  name,
  describe,
  modelKey: 'layout',
})

/** 函数绑定（纯 prop 回调，运行时编译为 Function） */
export const functionBind = (
  name: string,
  modelKey: string,
  describe?: string,
  options?: {
    params?: string[]
    example?: string
    placeholder?: string
  },
): PropConfigItem => {
  registerFunctionPropParams(modelKey, options?.params || [])
  return {
    eleType: 'PropFunctionBind',
    name,
    describe,
    modelKey,
    props: {
      label: name,
      params: options?.params || [],
      example: options?.example || '',
      placeholder: options?.placeholder || '点击右侧绑定函数',
    },
  }
}

export const createConfig = (props: PropConfigItem[]): ElementInfoConfig => ({
  props,
  styles: {},
  events: {},
  renderArgument: {},
})
