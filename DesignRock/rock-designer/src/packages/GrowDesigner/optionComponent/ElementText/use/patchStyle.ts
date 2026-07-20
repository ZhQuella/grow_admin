import type { Ref } from 'vue'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

export const createStylePatcher = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const patch = (updater: (draft: StyleMap) => void) => {
    const draft = { ...styleOption.value }
    updater(draft)
    emit('update:styleOption', draft)
  }

  const setOrDelete = (draft: StyleMap, key: string, value: any, empty?: any) => {
    if (value == null || value === '' || value === empty) {
      Reflect.deleteProperty(draft, key)
    } else {
      draft[key] = value
    }
  }

  return { patch, setOrDelete }
}
