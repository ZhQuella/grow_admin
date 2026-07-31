import { ref, watch, type Ref } from 'vue'

type StyleMap = Record<string, any>

export const useMargin = ({
  styleOption,
  emits,
}: {
  styleOption: Ref<StyleMap>
  emits: (event: 'update:styleOption', value: StyleMap) => void
}) => {
  const unitYMap = ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom']
  const unitXMap = ['margin-right', 'margin-left', 'padding-right', 'padding-left']

  const marginUnit = ref('px')

  const parseMarginUnit = (styles: StyleMap | undefined) => {
    const sample =
      styles?.['margin-top'] ||
      styles?.['margin-right'] ||
      styles?.['padding-top'] ||
      styles?.['padding-left']
    if (sample == null || sample === '') return 'px'
    const str = String(sample)
    if (str.endsWith('vh') || str.endsWith('vw')) return 'vw/vh'
    if (str.endsWith('%')) return '%'
    return 'px'
  }

  watch(
    styleOption,
    (styles) => {
      marginUnit.value = parseMarginUnit(styles)
    },
    { immediate: true, deep: true },
  )

  const onMarginUnitChange = (data: string) => {
    const result = { ...styleOption.value }
    for (let i = 0, item: string; (item = unitYMap[i++]); ) {
      const value = result[item]
      const unit = data === 'vw/vh' ? 'vh' : data
      value && (result[item] = `${parseFloat(value)}${unit}`)
    }
    for (let i = 0, item: string; (item = unitXMap[i++]); ) {
      const value = result[item]
      const unit = data === 'vw/vh' ? 'vw' : data
      value && (result[item] = `${parseFloat(value)}${unit}`)
    }
    marginUnit.value = data
    emits('update:styleOption', result)
  }

  const onMarginChange = (type: string, event: any) => {
    const result = { ...styleOption.value }
    if (event.target.value) {
      result[type] = `${event.target.value}${marginUnit.value}`
    } else {
      Reflect.deleteProperty(result, type)
    }
    emits('update:styleOption', result)
  }

  return {
    marginUnit,
    onMarginUnitChange,
    onMarginChange,
  }
}
