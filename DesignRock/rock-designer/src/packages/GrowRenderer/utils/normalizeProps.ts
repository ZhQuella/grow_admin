/** 运行时 props 兼容（对齐设计器 eleModuleComponent / basicComponent） */

import {
  TEXT_CONTENT_TAGS,
  normalizeModulePropsByTag,
  toRendererRelativeSize,
} from './modulePropsNormalizers'

const BASIC_TEXT_TAGS = new Set(['p', 'span', 'div', 'BasicTitle'])

export function normalizeBasicProps(
  tag: string,
  raw: Record<string, any> | undefined,
): Record<string, any> {
  const info = { ...(raw || {}) }
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')
  if (tag === 'BasicTitle' || ['p', 'span', 'div'].includes(tag)) {
    Reflect.deleteProperty(info, 'level')
    Reflect.deleteProperty(info, 'context')
  }
  if (TEXT_CONTENT_TAGS.has(tag)) {
    Reflect.deleteProperty(info, 'content')
  }
  return info
}

export function resolveBasicTag(
  tag: string | undefined,
  propsInfo: Record<string, any> | undefined,
): string | null {
  if (!tag) return null
  if (tag === 'BasicTitle') {
    const raw = String(propsInfo?.level || 'h3').toLowerCase()
    return /^h[1-6]$/.test(raw) ? raw : 'h3'
  }
  return tag
}

export function resolveBasicText(
  tag: string | undefined,
  propsInfo: Record<string, any> | undefined,
): string | undefined {
  if (!tag) return undefined
  if (tag === 'BasicTitle' || tag === 'p' || tag === 'span') {
    return propsInfo?.context ?? ''
  }
  return undefined
}

export function normalizeModuleProps(
  tag: string,
  raw: Record<string, any> | undefined,
): Record<string, any> {
  return normalizeModulePropsByTag(tag, { ...(raw || {}) }, raw, {
    defaultTreeSelectFilterable: true,
  })
}

export function resolveNodeStyle(
  styles: Record<string, any> | undefined,
): Record<string, any> {
  if (!styles) return {}
  const { class: _c, ...rest } = styles
  return rest
}

/**
 * 弹窗/抽屉：width/height 为 auto 时改为 fit-content，避免被布局撑成通屏。
 */
export function resolveOverlayHostStyle(
  styles: Record<string, any> | undefined,
): Record<string, any> {
  const style = { ...resolveNodeStyle(styles) }
  if (String(style.width) === 'auto') {
    style.width = 'fit-content'
  }
  if (String(style.height) === 'auto') {
    style.height = 'fit-content'
  }
  return style
}

export function resolveNodeClass(
  styles: Record<string, any> | undefined,
): string | undefined {
  return styles?.class
}

export { BASIC_TEXT_TAGS, TEXT_CONTENT_TAGS, toRendererRelativeSize }
