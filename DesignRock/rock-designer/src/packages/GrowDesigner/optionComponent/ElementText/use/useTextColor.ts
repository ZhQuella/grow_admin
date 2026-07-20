import type { Ref } from 'vue'
import { computed } from 'vue'
import { DEFAULT_TEXT_COLOR } from '../constants'
import { expandHex, parseColor, toCssColor } from './color'
import { createStylePatcher } from './patchStyle'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

export const useTextColor = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const { patch, setOrDelete } = createStylePatcher(styleOption, emit)

  const parsedColor = computed(() => parseColor(styleOption.value?.color))
  const hexValue = computed(() => parsedColor.value?.hex || DEFAULT_TEXT_COLOR)
  const hexText = computed(() => parsedColor.value?.hex?.replace('#', '') || '')
  const alphaPercent = computed(() => Math.round((parsedColor.value?.alpha ?? 1) * 100))
  const cssColor = computed(() =>
    parsedColor.value ? toCssColor(parsedColor.value.hex, parsedColor.value.alpha) : '',
  )

  const emitColor = (hex: string, alpha: number) => {
    patch((draft) => setOrDelete(draft, 'color', toCssColor(hex, alpha) || undefined))
  }

  const onColorPick = (event: Event) => {
    const hex = expandHex((event.target as HTMLInputElement).value).slice(0, 7)
    emitColor(hex, parsedColor.value?.alpha ?? 1)
  }

  const onColorText = (raw: string | null) => {
    if (raw == null || raw === '') {
      patch((d) => Reflect.deleteProperty(d, 'color'))
      return
    }
    const next = parseColor(raw.startsWith('#') ? raw : `#${raw}`)
    if (!next) return
    emitColor(next.hex, parsedColor.value?.alpha ?? next.alpha)
  }

  const onAlphaChange = (value: number | null) => {
    emitColor(parsedColor.value?.hex || DEFAULT_TEXT_COLOR, (value ?? 100) / 100)
  }

  return { cssColor, hexValue, hexText, alphaPercent, onColorPick, onColorText, onAlphaChange }
}
