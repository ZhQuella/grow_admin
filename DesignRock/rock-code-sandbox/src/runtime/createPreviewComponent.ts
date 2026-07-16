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
import {
  collectReachableFiles,
  normalizeSandboxFiles,
  normalizeSandboxPath,
  rewriteRelativeImportPaths,
  type SandboxFiles,
} from './virtualFiles'

export interface PreviewCompileResult {
  component: Component | null
  error: string | null
}

export interface CreatePreviewOptions {
  /** 虚拟多文件；提供时以 entry 为预览入口，并解析 ./ 相对引用 */
  files?: SandboxFiles
  /** 入口文件，默认 App.vue */
  entry?: string
}

export type { SandboxFiles }

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
 * vue 始终可用；其余包需出现在 moduleMap。
 */
function rewriteImports(code: string, moduleMap: Record<string, unknown>): string {
  return code.replace(
    /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
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

/** 处理 export default / export named，供 New Function 求值 */
function rewriteExports(code: string): string {
  let body = code.replace(/export\s+default\s+/g, '__exports__.default = ')

  body = body.replace(
    /export\s+(async\s+)?function\s*\*\s*([A-Za-z_$][\w$]*)/g,
    '__exports__.$2 = $1function* $2',
  )
  body = body.replace(
    /export\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    '__exports__.$2 = $1function $2',
  )
  body = body.replace(
    /export\s+class\s+([A-Za-z_$][\w$]*)/g,
    '__exports__.$1 = class $1',
  )
  body = body.replace(
    /export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g,
    '$1 $2 = __exports__.$2 =',
  )
  body = body.replace(/export\s+\{([^}]+)\}(\s*;)?/g, (_full, list: string) => {
    return list
      .split(',')
      .map((part) => {
        const token = part.trim()
        if (!token) return ''
        const [imported, alias] = token.split(/\s+as\s+/).map((s) => s.trim())
        if (!imported) return ''
        const exported = alias || imported
        return `__exports__[${JSON.stringify(exported)}] = ${imported};`
      })
      .filter(Boolean)
      .join('\n')
  })

  return body
}

function evaluateModuleExports(
  code: string,
  apis: Record<string, (...args: any[]) => any> = {},
  modules: Record<string, unknown> = {},
): Record<string, unknown> {
  const moduleMap: Record<string, unknown> = { vue: Vue, ...modules }
  const jsCode = toRunnableJs(code)
  const body = rewriteExports(rewriteImports(jsCode, moduleMap))

  // eslint-disable-next-line no-new-func
  const factory = new Function(
    '__modules__',
    '__sandbox_apis__',
    `
      const __exports__ = {};
      ${body}
      return __exports__;
    `,
  )
  return factory(moduleMap, apis) as Record<string, unknown>
}

function evaluateDefaultComponent(
  code: string,
  apis: Record<string, (...args: any[]) => any> = {},
  modules: Record<string, unknown> = {},
): any {
  const exports = evaluateModuleExports(code, apis, modules)
  return exports.default ?? exports
}

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

function forceFullPropsPatch(code: string) {
  return code
    .replace(/, 8 \/\* PROPS \*\/, \[[^\]]*\]\)/g, ', 16 /* FULL_PROPS */)')
    .replace(
      /, 1032 \/\* PROPS, DYNAMIC_SLOTS \*\/, \[[^\]]*\]\)/g,
      ', 1040 /* FULL_PROPS, DYNAMIC_SLOTS */)',
    )
}

function compileVueSourceToComponent(
  source: string,
  expose: SandboxExpose,
  modules: Record<string, unknown>,
  filename: string,
): Component {
  const parts = parseVueSfc(source)
  const apiNames = Object.keys(expose.apis ?? {})
  const withHelpers = composeVueSfc({
    ...parts,
    script: injectApiPrelude(parts.script, apiNames),
    scriptLang: parts.scriptLang || 'ts',
  })

  const id = hashId(`${filename}\n${withHelpers}`)
  const { descriptor, errors } = parse(withHelpers, {
    filename: filename.endsWith('.vue') ? filename : `${filename}.vue`,
  })
  if (errors.length) {
    throw errors[0]
  }
  if (!descriptor.template) {
    throw new Error(`${filename} 缺少 <template>`)
  }

  compileStyles(descriptor, id)

  const hasScopedStyle = descriptor.styles.some((item) => item.scoped)
  const isProd = process.env.NODE_ENV === 'production'
  const compiled = compileScript(descriptor, {
    id,
    inlineTemplate: true,
    isProd,
    templateOptions: {
      scoped: hasScopedStyle,
      compilerOptions: {
        scopeId: hasScopedStyle ? id : undefined,
        hoistStatic: false,
        cacheHandlers: false,
      },
    },
  })

  const rawComponent = evaluateDefaultComponent(
    forceFullPropsPatch(compiled.content),
    expose.apis ?? {},
    modules,
  )

  if (hasScopedStyle) {
    rawComponent.__scopeId = id
  }

  const hostComponents = Object.fromEntries(
    Object.entries(expose.components ?? {}).filter(([, comp]) => Boolean(comp)),
  )
  const originalSetup = rawComponent.setup
  rawComponent.components = {
    ...(rawComponent.components || {}),
    ...hostComponents,
  }
  rawComponent.setup = (props: any, ctx: any) => {
    provide(SANDBOX_EXPOSE_KEY, expose)
    const userState = typeof originalSetup === 'function' ? originalSetup(props, ctx) : {}
    return userState
  }

  return markRaw(rawComponent)
}

function compileJsSourceToModule(
  source: string,
  expose: SandboxExpose,
  modules: Record<string, unknown>,
  filename: string,
): Record<string, unknown> {
  const apiNames = Object.keys(expose.apis ?? {})
  const withApis = injectApiPrelude(source, apiNames)
  try {
    return evaluateModuleExports(withApis, expose.apis ?? {}, modules)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`${filename}: ${msg}`)
  }
}

/** 按依赖顺序编译虚拟文件到 modules */
function buildModulesFromFiles(
  files: SandboxFiles,
  entry: string,
  expose: SandboxExpose,
): Record<string, unknown> {
  const normalized = normalizeSandboxFiles(files)
  const order = collectReachableFiles(entry, normalized)
  const modules: Record<string, unknown> = { ...(expose.modules ?? {}) }

  order.forEach((path) => {
    if (path === normalizeSandboxPath(entry)) return
    const raw = normalized[path] ?? ''
    const rewritten = rewriteRelativeImportPaths(raw, path, normalized)
    if (/\.vue$/i.test(path)) {
      const component = compileVueSourceToComponent(rewritten, expose, modules, path)
      modules[path] = { default: component }
    } else if (/\.(js|mjs|cjs)$/i.test(path)) {
      modules[path] = compileJsSourceToModule(rewritten, expose, modules, path)
    } else {
      throw new Error(`暂不支持的文件类型: ${path}`)
    }
  })

  return modules
}

/**
 * 将完整 Vue SFC（template/script/style）编译为宿主树内可挂载组件。
 * 可选 files：多文件虚拟目录，入口默认 App.vue，支持 ./ 相对引用。
 */
export function createPreviewComponent(
  source: string,
  expose: SandboxExpose = {},
  options: CreatePreviewOptions = {},
): PreviewCompileResult {
  try {
    const files = options.files ? normalizeSandboxFiles(options.files) : null
    const entry = normalizeSandboxPath(options.entry || 'App.vue')
    let entrySource = source
    let modules = { ...(expose.modules ?? {}) }

    if (files) {
      entrySource = files[entry] ?? source
      if (!entrySource?.trim()) {
        return { component: null, error: null }
      }
      modules = buildModulesFromFiles(files, entry, expose)
      entrySource = rewriteRelativeImportPaths(entrySource, entry, files)
    } else if (!entrySource?.trim()) {
      return { component: null, error: null }
    }

    const mergedExpose: SandboxExpose = {
      ...expose,
      modules,
    }

    const component = compileVueSourceToComponent(
      entrySource,
      mergedExpose,
      modules,
      entry,
    )
    component.name = 'GrowSandboxPreview'

    return { component, error: null }
  } catch (e) {
    return {
      component: null,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
