export type VueSfcPart = 'template' | 'script' | 'style'

export interface VueSfcParts {
  template: string
  script: string
  style: string
  /** script 标签语言，如 ts */
  scriptLang?: string
  /** style 是否 scoped */
  styleScoped?: boolean
}

const TEMPLATE_RE = /<template[^>]*>([\s\S]*?)<\/template>/i
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/i
const STYLE_RE = /<style([^>]*)>([\s\S]*?)<\/style>/i

function getAttr(attrs: string, name: string): string | undefined {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i')
  return attrs.match(re)?.[1]
}

function hasFlag(attrs: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`, 'i').test(attrs)
}

/** 解析 Vue SFC（无三段时，整体视为 template） */
export function parseVueSfc(code: string): VueSfcParts {
  const source = code ?? ''
  const hasTemplate = TEMPLATE_RE.test(source)
  const hasScript = SCRIPT_RE.test(source)
  const hasStyle = STYLE_RE.test(source)

  if (!hasTemplate && !hasScript && !hasStyle) {
    return {
      template: source,
      script: '',
      style: '',
      scriptLang: 'ts',
      styleScoped: true,
    }
  }

  const scriptMatch = source.match(SCRIPT_RE)
  const styleMatch = source.match(STYLE_RE)
  const templateMatch = source.match(TEMPLATE_RE)

  const scriptAttrs = scriptMatch?.[1] ?? ''
  const styleAttrs = styleMatch?.[1] ?? ''

  return {
    template: (templateMatch?.[1] ?? '').replace(/^\n/, '').replace(/\n$/, ''),
    script: (scriptMatch?.[2] ?? '').replace(/^\n/, '').replace(/\n$/, ''),
    style: (styleMatch?.[2] ?? '').replace(/^\n/, '').replace(/\n$/, ''),
    scriptLang: getAttr(scriptAttrs, 'lang') || 'ts',
    styleScoped: !styleMatch || hasFlag(styleAttrs, 'scoped'),
  }
}

/** 组装 Vue SFC 文本 */
export function composeVueSfc(parts: VueSfcParts): string {
  const chunks: string[] = []
  const template = parts.template.trimEnd()
  const script = parts.script.trimEnd()
  const style = parts.style.trimEnd()
  const scriptLang = parts.scriptLang || 'ts'
  const scoped = parts.styleScoped !== false

  chunks.push(`<template>\n${template}\n</template>`)

  if (script.trim()) {
    const langAttr = scriptLang && scriptLang !== 'js' ? ` lang="${scriptLang}"` : ''
    chunks.push(`\n\n<script setup${langAttr}>\n${script}\n</script>`)
  }

  if (style.trim()) {
    chunks.push(`\n\n<style${scoped ? ' scoped' : ''}>\n${style}\n</style>`)
  }

  return `${chunks.join('')}\n`
}
