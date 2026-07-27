/** 图表配置项声明（对齐低代码 PropConfigItem） */

export type ChartPropConfigItem = {
  eleType: string
  name: string
  describe?: string
  modelKey: string
  props?: Record<string, any>
}

export const boolSwitch = (
  name: string,
  modelKey: string,
  describe?: string,
): ChartPropConfigItem => ({
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
): ChartPropConfigItem => ({
  eleType: 'GrowInput',
  name,
  describe,
  modelKey,
  props: {
    placeholder: placeholder || `请输入${name}`,
    clearable: true,
  },
})

export const textareaInput = (
  name: string,
  modelKey: string,
  describe?: string,
  placeholder?: string,
): ChartPropConfigItem => ({
  eleType: 'GrowInput',
  name,
  describe,
  modelKey,
  props: {
    type: 'textarea',
    rows: 6,
    placeholder: placeholder || `请输入${name}`,
    clearable: true,
  },
})

export const numberInput = (
  name: string,
  modelKey: string,
  describe?: string,
): ChartPropConfigItem => ({
  eleType: 'GrowInputNumber',
  name,
  describe,
  modelKey,
  props: {
    controls: false,
    class: 'w-full',
  },
})

export const selectInput = (
  name: string,
  modelKey: string,
  options: Array<{ label: string; value: any }>,
  describe?: string,
): ChartPropConfigItem => ({
  eleType: 'GrowSelect',
  name,
  describe,
  modelKey,
  props: {
    placeholder: `请选择${name}`,
    options,
    clearable: true,
    class: 'w-full',
  },
})

export const sectionTitle = (name: string): ChartPropConfigItem => ({
  eleType: 'ChartSectionTitle',
  name,
  modelKey: `__section_${name}__`,
})

export const colorInput = (
  name: string,
  modelKey: string,
  describe?: string,
): ChartPropConfigItem => ({
  eleType: 'ChartColorInput',
  name,
  describe,
  modelKey,
})

export const codeEditorInput = (
  name: string,
  modelKey: string,
  describe?: string,
  language: 'json' | 'javascript' | 'expression' = 'json',
): ChartPropConfigItem => ({
  eleType: 'ChartCodeEditor',
  name,
  describe,
  modelKey,
  props: {
    defaultLanguage: language,
    languageSwitchable: false,
  },
})
