import type { Ref } from 'vue'
import { computed } from 'vue'
import type { ResizeMode } from '../constants'
import { createStylePatcher } from './patchStyle'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

const applyResizeMode = (draft: StyleMap, mode: ResizeMode) => {
  if (mode === 'auto') {
    draft['white-space'] = 'nowrap'
    Reflect.deleteProperty(draft, 'overflow')
    Reflect.deleteProperty(draft, 'text-overflow')
    if (draft.width === '100%') Reflect.deleteProperty(draft, 'width')
    return
  }
  if (mode === 'fixed') {
    draft.overflow = 'hidden'
    draft['text-overflow'] = 'ellipsis'
    draft['white-space'] = 'nowrap'
    return
  }
  draft['white-space'] = 'normal'
  Reflect.deleteProperty(draft, 'overflow')
  Reflect.deleteProperty(draft, 'text-overflow')
}

const applyListStyle = (draft: StyleMap, current: string, value: string) => {
  if (current === value) {
    Reflect.deleteProperty(draft, 'list-style-type')
    Reflect.deleteProperty(draft, 'list-style-position')
    if (draft.display === 'list-item') Reflect.deleteProperty(draft, 'display')
    return
  }
  draft['list-style-type'] = value
  draft['list-style-position'] = 'inside'
  draft.display = 'list-item'
}

const applyClipText = (draft: StyleMap, enabled: boolean, keepNowrap: boolean) => {
  if (enabled) {
    draft.overflow = 'hidden'
    draft['text-overflow'] = 'ellipsis'
    draft['white-space'] = 'nowrap'
    return
  }
  Reflect.deleteProperty(draft, 'overflow')
  Reflect.deleteProperty(draft, 'text-overflow')
  if (draft['white-space'] === 'nowrap' && !keepNowrap) {
    Reflect.deleteProperty(draft, 'white-space')
  }
}

const resolveResizeMode = (style: StyleMap): ResizeMode => {
  if (style['white-space'] === 'nowrap' && style.overflow !== 'hidden') return 'auto'
  if (style.overflow === 'hidden') return 'fixed'
  return 'fixed-width'
}

export const useTextMore = (styleOption: Ref<StyleMap>, emit: EmitFn) => {
  const { patch, setOrDelete } = createStylePatcher(styleOption, emit)
  const resizeMode = computed(() => resolveResizeMode(styleOption.value))
  const writingMode = computed(() => styleOption.value['writing-mode'] || 'horizontal-tb')
  const listStyle = computed(() => {
    const type = styleOption.value['list-style-type']
    return type === 'disc' || type === 'decimal' ? type : ''
  })
  const paragraphSpacing = computed(() => parseFloat(styleOption.value['margin-bottom']) || 0)
  const clipText = computed(
    () =>
      styleOption.value.overflow === 'hidden' &&
      (styleOption.value['text-overflow'] === 'ellipsis' ||
        Boolean(styleOption.value['-webkit-line-clamp'])),
  )
  const paddingValue = (side: string) => parseFloat(styleOption.value[`padding-${side}`]) || 0

  return {
    resizeMode,
    writingMode,
    listStyle,
    paragraphSpacing,
    clipText,
    paddingValue,
    onResizeMode: (mode: ResizeMode) => patch((d) => applyResizeMode(d, mode)),
    onWritingMode: (v: string) => patch((d) => setOrDelete(d, 'writing-mode', v, 'horizontal-tb')),
    onListStyle: (v: string) => patch((d) => applyListStyle(d, listStyle.value, v)),
    onParagraphSpacing: (v: number | null) =>
      patch((d) => setOrDelete(d, 'margin-bottom', v != null ? `${v}px` : undefined, '0px')),
    onClipText: (enabled: boolean) =>
      patch((d) => applyClipText(d, enabled, resizeMode.value === 'auto')),
    onPadding: (side: string, v: number | null) =>
      patch((d) => setOrDelete(d, `padding-${side}`, v != null ? `${v}px` : undefined, '0px')),
  }
}
