/** 属性配置项公共类型与复用选项 */

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

export const createConfig = (props: PropConfigItem[]): ElementInfoConfig => ({
  props,
  styles: {},
  events: {},
  renderArgument: {},
})
