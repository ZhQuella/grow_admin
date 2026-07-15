import {
  compileStyle,
  compileScript,
  parse,
  type SFCDescriptor,
} from '@vue/compiler-sfc'
import { transform } from 'sucrase'
import * as Vue from 'vue'
import { markRaw, provide, type Component } from 'vue'
import { SANDBOX_EXPOSE_KEY } from '../context'
import type { SandboxExpose } from '../types'
import { composeVueSfc, parseVueSfc } from '../utils/vueSfc'

export interface PreviewCompileResult {
  component: Component | null
  error: string | null
}

const styleElMap = new Map<string, HTMLStyleElement>()

function hashId(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return `data-v-${Math.abs(hash).toString(16)}`
}

function upsertStyle(id: string, css: string) {
  if (typeof document === 'undefined') return
  let el = styleElMap.get(id)
  if (!el) {
    el = document.createElement('style')
    el.dataset.sandboxStyle = id
    document.head.appendChild(el)
    styleElMap.set(id, el)
  }
  el.textContent = css
}

function clearSandboxStyles(prefix: string) {
  if (typeof document === 'undefined') return
  styleElMap.forEach((el, id) => {
    if (id === prefix || id.startsWith(`${prefix}-`)) {
      el.remove()
      styleElMap.delete(id)
    }
  })
}

function toRunnableJs(code: string) {
  return transform(code, {
    transforms: ['typescript'],
    disableESTransforms: true,
  }).code
}

/**
 * 将 import 替换为从 __modules__ 取值的声明。
 * vue 始终可用；其余包需出现在 expose.modules。
 */
function rewriteImports(code: string, moduleMap: Record<string, unknown>): string {
  return code.replace(
    /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    (_full, clauseRaw: string, source: string) => {
      if (!(source in moduleMap)) {
        throw new Error(`沙箱未提供模块: ${source}`)
      }
      const key = JSON.stringify(source)
      const clause = clauseRaw.trim()
      const lines: string[] = []

      if (clause.startsWith('*')) {
        const ns = clause.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)
        if (!ns) throw new Error(`无法解析 import: ${clause}`)
        lines.push(`const ${ns[1]} = __modules__[${key}];`)
        return `${lines.join('\n')}\n`
      }

      let rest = clause
      if (!clause.startsWith('{')) {
        const def = clause.match(/^([A-Za-z_$][\w$]*)\s*(?:,(.*))?$/)
        if (def) {
          lines.push(
            `const ${def[1]} = __modules__[${key}].default ?? __modules__[${key}];`,
          )
          rest = (def[2] ?? '').trim()
        }
      }

      const named = rest.match(/\{([^}]+)\}/)
      if (named) {
        named[1].split(',').forEach((part) => {
          const token = part.trim()
          if (!token) return
          const [imported, alias] = token.split(/\s+as\s+/).map((s) => s.trim())
          if (!imported) return
          const local = alias || imported
          lines.push(`const ${local} = __modules__[${key}][${JSON.stringify(imported)}];`)
        })
      }

      return `${lines.join('\n')}\n`
    },
  )
}

function evaluateCompiledScript(
  code: string,
  apis: Record<string, (...args: any[]) => any> = {},
  modules: Record<string, unknown> = {},
): any {
  const moduleMap: Record<string, unknown> = { vue: Vue, ...modules }
  const jsCode = toRunnableJs(code)
  const body = rewriteImports(jsCode, moduleMap).replace(
    /export\s+default/,
    'const __default__ =',
  )

  // eslint-disable-next-line no-new-func
  const factory = new Function(
    '__modules__',
    '__sandbox_apis__',
    `
      ${body}
      return __default__;
    `,
  )
  return factory(moduleMap, apis)
}

/** 将宿主 apis（如 useRequest）注入到 setup 作用域 */
function injectApiPrelude(script: string, apiNames: string[]): string {
  const names = apiNames.filter((name) => /^[A-Za-z_$][\w$]*$/.test(name))
  if (!names.length) return script

  const bindings = names
    .map(
      (name) => `const ${name} = (...args) => {
  const fn = __sandbox_apis__[${JSON.stringify(name)}]
  if (typeof fn !== 'function') {
    throw new Error(${JSON.stringify(`未注入 ${name}`)})
  }
  return fn(...args)
}`,
    )
    .join('\n')

  return script.trim() ? `${bindings}\n${script}` : bindings
}

function compileStyles(descriptor: SFCDescriptor, id: string) {
  clearSandboxStyles(id)
  descriptor.styles.forEach((style, index) => {
    const { code, errors } = compileStyle({
      source: style.content,
      filename: descriptor.filename,
      id,
      scoped: style.scoped,
    })
    if (errors.length) {
      throw errors[0]
    }
    upsertStyle(`${id}-${index}`, code)
  })
}

/**
 * 将完整 Vue SFC（template/script/style）编译为宿主树内可挂载组件。
 */
export function createPreviewComponent(
  source: string,
  expose: SandboxExpose = {},
): PreviewCompileResult {
  const raw = source?.trim()
  if (!raw) {
    return { component: null, error: null }
  }

  try {
    const parts = parseVueSfc(raw)
    const apiNames = Object.keys(expose.apis ?? {})
    const withHelpers = composeVueSfc({
      ...parts,
      script: injectApiPrelude(parts.script, apiNames),
      scriptLang: parts.scriptLang || 'ts',
    })

    const id = hashId(withHelpers)
    const { descriptor, errors } = parse(withHelpers, {
      filename: `${id}.vue`,
    })
    if (errors.length) {
      throw errors[0]
    }
    if (!descriptor.template) {
      throw new Error('SFC 缺少 <template>')
    }

    compileStyles(descriptor, id)

    const hasScopedStyle = descriptor.styles.some((item) => item.scoped)
    const compiled = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      templateOptions: {
        scoped: hasScopedStyle,
        compilerOptions: {
          scopeId: hasScopedStyle ? id : undefined,
        },
      },
    })

    const rawComponent = evaluateCompiledScript(
      compiled.content,
      expose.apis ?? {},
      expose.modules ?? {},
    )
    const hostComponents = Object.fromEntries(
      Object.entries(expose.components ?? {}).filter(([, comp]) => Boolean(comp)),
    )

    // compileScript 内联模板不会自动写入 __scopeId，需手动挂上，scoped CSS 才能命中根节点
    if (hasScopedStyle) {
      rawComponent.__scopeId = id
    }

    const originalSetup = rawComponent.setup
    rawComponent.components = {
      ...(rawComponent.components || {}),
      ...hostComponents,
    }
    rawComponent.name = 'GrowSandboxPreview'
    rawComponent.setup = (props: any, ctx: any) => {
      provide(SANDBOX_EXPOSE_KEY, expose)
      const userState = typeof originalSetup === 'function' ? originalSetup(props, ctx) : {}
      return userState
    }

    return { component: markRaw(rawComponent), error: null }
  } catch (e) {
    return {
      component: null,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
