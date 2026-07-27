import type { Ref } from 'vue'
import { computed } from 'vue'
import { parseColor, toCssColor } from './color'
import { createStylePatcher } from './patchStyle'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

export const useTextColor = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const { patch, setOrDelete } = createStylePatcher(styleOption, emit)

  const parsedColor = computed(() => parseColor(styleOption.value?.color))
  const cssColor = computed(() =>
    parsedColor.value ? toCssColor(parsedColor.value.hex, parsedColor.value.alpha) : '',
  )

  /** ColorPicker 直接写入完整颜色字符串（hex / rgba） */
  const onColorChange = (value: string | null) => {
    const next = String(value || '').trim()
    if (!next || next === 'transparent') {
      patch((draft) => Reflect.deleteProperty(draft, 'color'))
      return
    }
    patch((draft) => setOrDelete(draft, 'color', next))
  }

  return { cssColor, onColorChange }
}
