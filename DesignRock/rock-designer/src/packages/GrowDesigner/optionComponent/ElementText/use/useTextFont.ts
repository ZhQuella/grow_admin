import type { Ref } from 'vue'
import { computed } from 'vue'
import type { FontStyleKey } from '../constants'
import { createStylePatcher } from './patchStyle'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void
type SetOrDelete = (d: StyleMap, k: string, v: any, empty?: any) => void

const DEFAULT_LINE_HEIGHT_RATIO = 1.4

const isFontStyleActive = (style: StyleMap, key: FontStyleKey) => {
  if (key === 'bold') return style['font-weight'] === 'bold' || Number(style['font-weight']) >= 600
  if (key === 'italic') return style['font-style'] === 'italic'
  const deco = String(style['text-decoration'] || '')
  if (key === 'underline') return deco.includes('underline')
  if (key === 'strike') return deco.includes('line-through')
  return false
}

const applyFontStyleToggle = (
  draft: StyleMap,
  setOrDelete: SetOrDelete,
  key: FontStyleKey,
  active: boolean,
) => {
  if (key === 'bold') {
    setOrDelete(draft, 'font-weight', active ? undefined : 'bold')
    return
  }
  if (key === 'italic') {
    setOrDelete(draft, 'font-style', active ? undefined : 'italic')
    return
  }
  const token = key === 'underline' ? 'underline' : 'line-through'
  const parts = new Set(
    String(draft['text-decoration'] || '')
      .split(/\s+/)
      .filter((p) => p && p !== 'none'),
  )
  if (parts.has(token)) parts.delete(token)
  else parts.add(token)
  setOrDelete(draft, 'text-decoration', parts.size ? [...parts].join(' ') : undefined)
}

/** 解析行高：无单位倍率会随字号缩放；px 则返回固定像素值 */
const resolveLineHeightPx = (raw: unknown, fontSizePx: number) => {
  if (raw == null || raw === '') return Math.round(fontSizePx * DEFAULT_LINE_HEIGHT_RATIO)
  const n = parseFloat(String(raw))
  if (!Number.isFinite(n)) return Math.round(fontSizePx * DEFAULT_LINE_HEIGHT_RATIO)
  if (!String(raw).includes('px')) return Math.round(fontSizePx * n)
  return n
}

/** 字号变大时，若行高为过小的 px，则按比例抬升，避免文字被裁切 */
const syncLineHeightWithFontSize = (draft: StyleMap, fontSizePx: number) => {
  const raw = draft['line-height']
  if (raw == null || raw === '') {
    draft['line-height'] = String(DEFAULT_LINE_HEIGHT_RATIO)
    return
  }
  const isPx = String(raw).includes('px')
  if (!isPx) return
  const lh = parseFloat(String(raw))
  if (!Number.isFinite(lh) || lh < fontSizePx) {
    draft['line-height'] = `${Math.round(fontSizePx * DEFAULT_LINE_HEIGHT_RATIO)}px`
  }
}

export const useTextFont = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const { patch, setOrDelete } = createStylePatcher(styleOption, emit)
  const fontSize = computed(() => parseFloat(styleOption.value['font-size']) || 14)
  const letterSpacing = computed(() => parseFloat(styleOption.value['letter-spacing']) || 0)
  const lineHeight = computed(() =>
    resolveLineHeightPx(styleOption.value['line-height'], fontSize.value),
  )
  const isStyleActive = (key: FontStyleKey) => isFontStyleActive(styleOption.value, key)
  const toggleFontStyle = (key: FontStyleKey) => {
    patch((d) => applyFontStyleToggle(d, setOrDelete, key, isStyleActive(key)))
  }
  const onFontSizeChange = (v: number | null) => {
    patch((d) => {
      setOrDelete(d, 'font-size', v != null ? `${v}px` : undefined)
      if (v != null) syncLineHeightWithFontSize(d, v)
    })
  }
  const onLetterSpacing = (v: number | null) => {
    patch((d) => setOrDelete(d, 'letter-spacing', v != null ? `${v}px` : undefined, '0px'))
  }
  const onLineHeight = (v: number | null) => {
    patch((d) => setOrDelete(d, 'line-height', v != null ? `${v}px` : undefined))
  }
  return {
    fontSize,
    onFontSizeChange,
    isStyleActive,
    toggleFontStyle,
    letterSpacing,
    lineHeight,
    onLetterSpacing,
    onLineHeight,
  }
}
