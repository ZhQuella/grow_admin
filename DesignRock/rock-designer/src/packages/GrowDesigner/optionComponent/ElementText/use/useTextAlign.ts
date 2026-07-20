import type { Ref } from 'vue'
import { computed } from 'vue'
import { createStylePatcher } from './patchStyle'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

export const useTextAlign = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const { patch, setOrDelete } = createStylePatcher(styleOption, emit)

  const textAlign = computed(() => styleOption.value['text-align'] || 'left')
  const verticalAlign = computed(() => styleOption.value['align-items'] || 'flex-start')

  const onTextAlign = (value: string) => {
    patch((draft) => setOrDelete(draft, 'text-align', value, 'left'))
  }

  const onVerticalAlign = (value: string) => {
    patch((draft) => {
      draft['align-items'] = value
      const display = draft.display
      if (!display || display === 'block' || display === 'inline-block') {
        draft.display = display === 'inline-block' ? 'inline-flex' : 'flex'
      }
    })
  }

  return { textAlign, verticalAlign, onTextAlign, onVerticalAlign }
}
