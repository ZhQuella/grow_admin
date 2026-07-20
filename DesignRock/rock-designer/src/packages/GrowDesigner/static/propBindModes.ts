/** 属性输入模式：普通文本 / 变量绑定 */

export type PropBindMode = 'text' | 'bind'

/** uuid -> modelKey -> mode */
export type PropBindModesMap = Record<string, Record<string, PropBindMode>>

export const PROP_BIND_MODE_TEXT: PropBindMode = 'text'
export const PROP_BIND_MODE_BIND: PropBindMode = 'bind'

export const normalizePropBindMode = (mode?: string | null): PropBindMode =>
  mode === PROP_BIND_MODE_BIND ? PROP_BIND_MODE_BIND : PROP_BIND_MODE_TEXT
