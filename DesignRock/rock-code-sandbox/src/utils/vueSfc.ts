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

function getAttr(attrs: string, name: string): string | undefined {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i')
  return attrs.match(re)?.[1]
}

function hasFlag(attrs: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`, 'i').test(attrs)
}

/**
 * 提取最外层成对标签（支持嵌套同名标签，如 template 内再写 slot template）。
 */
function extractOuterTag(
  source: string,
  tagName: string,
): { attrs: string; content: string } | null {
  const openRe = new RegExp(`<${tagName}(\\s[^>]*)?>`, 'i')
  const open = openRe.exec(source)
  if (!open || open.index === undefined) return null

  const attrs = open[1] ?? ''
  const contentStart = open.index + open[0].length
  let depth = 1
  const tokenRe = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi')
  tokenRe.lastIndex = contentStart

  let token: RegExpExecArray | null
  while ((token = tokenRe.exec(source))) {
    const isClose = /^<\//.test(token[0])
    const selfClosing = /\/>$/.test(token[0])
    if (isClose) {
      depth -= 1
      if (depth === 0) {
        return {
          attrs,
          content: source.slice(contentStart, token.index),
        }
      }
      continue
    }
    if (!selfClosing) {
      depth += 1
    }
  }

  return null
}

function trimBlock(content: string) {
  return content.replace(/^\n/, '').replace(/\n$/, '')
}

/** 解析 Vue SFC（无三段时，整体视为 template） */
export function parseVueSfc(code: string): VueSfcParts {
  const source = code ?? ''
  const templateBlock = extractOuterTag(source, 'template')
  const scriptBlock = extractOuterTag(source, 'script')
  const styleBlock = extractOuterTag(source, 'style')

  if (!templateBlock && !scriptBlock && !styleBlock) {
    return {
      template: source,
      script: '',
      style: '',
      scriptLang: 'ts',
      styleScoped: true,
    }
  }

  const scriptAttrs = scriptBlock?.attrs ?? ''
  const styleAttrs = styleBlock?.attrs ?? ''

  return {
    template: trimBlock(templateBlock?.content ?? ''),
    script: trimBlock(scriptBlock?.content ?? ''),
    style: trimBlock(styleBlock?.content ?? ''),
    scriptLang: getAttr(scriptAttrs, 'lang') || 'ts',
    styleScoped: !styleBlock || hasFlag(styleAttrs, 'scoped'),
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
