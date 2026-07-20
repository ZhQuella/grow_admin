import type { Ref } from 'vue'
import { useTextAlign } from './useTextAlign'
import { useTextColor } from './useTextColor'
import { useTextFont } from './useTextFont'
import { useTextMore } from './useTextMore'

type StyleMap = Record<string, any>
type EmitFn = (event: 'update:styleOption', value: StyleMap) => void

/** 组合文字样式相关 composable */
export const useTextStyle = (styleOption: Ref<StyleMap>, emit: EmitFn) => ({
  ...useTextColor(styleOption, emit),
  ...useTextFont(styleOption, emit),
  ...useTextAlign(styleOption, emit),
  ...useTextMore(styleOption, emit),
})
