import type { CodeDependency } from '../types'

const moduleCache = new Map<string, Promise<Record<string, unknown>>>()

/** 从 CDN 动态加载 npm 包（无需安装到本仓库） */
export function loadNpmModule(
  name: string,
  version?: string,
): Promise<Record<string, unknown>> {
  const key = `${name}@${version || 'latest'}`
  const cached = moduleCache.get(key)
  if (cached) return cached

  const spec = version ? `${name}@${version}` : name
  // esm.sh 提供浏览器可直接 import 的 ESM
  const url = `https://esm.sh/${spec}`

  const pending = import(/* @vite-ignore */ url).then((mod) => {
    const record = mod as Record<string, unknown>
    return record
  })

  moduleCache.set(key, pending)
  return pending
}

function packageShortName(name: string) {
  const parts = name.split('/')
  return parts[parts.length - 1] || name
}

/**
 * 将 CDN 模块中的方法挂到 apis，便于脚本内直接调用（如 nanoid()）。
 * 优先使用 dep.injectAs；否则取与包短名同名的导出，或 default。
 */
export function pickCallableApis(
  mod: Record<string, unknown>,
  dep: CodeDependency,
): Record<string, (...args: any[]) => any> {
  const apis: Record<string, (...args: any[]) => any> = {}
  const names =
    dep.injectAs?.length
      ? dep.injectAs
      : [packageShortName(dep.name)].filter(Boolean)

  names.forEach((exportName) => {
    const fn = mod[exportName]
    if (typeof fn === 'function') {
      apis[exportName] = fn as (...args: any[]) => any
    }
  })

  if (!Object.keys(apis).length && typeof mod.default === 'function') {
    const alias = packageShortName(dep.name).replace(/[^A-Za-z0-9_$]/g, '_') || 'defaultExport'
    if (/^[A-Za-z_$]/.test(alias)) {
      apis[alias] = mod.default as (...args: any[]) => any
    }
  }

  return apis
}

export interface ResolvedNpmExpose {
  modules: Record<string, Record<string, unknown>>
  apis: Record<string, (...args: any[]) => any>
}

/** 解析依赖列表中 source=npm 且已启用的项 */
export async function resolveNpmDependencies(
  dependencies: CodeDependency[] = [],
): Promise<ResolvedNpmExpose> {
  const modules: Record<string, Record<string, unknown>> = {}
  const apis: Record<string, (...args: any[]) => any> = {}

  const npmDeps = dependencies.filter(
    (item) =>
      item.source === 'npm'
      && (item.locked || item.enabled !== false),
  )

  await Promise.all(
    npmDeps.map(async (dep) => {
      const mod = await loadNpmModule(dep.name, dep.version)
      modules[dep.name] = mod
      Object.assign(apis, pickCallableApis(mod, dep))
    }),
  )

  return { modules, apis }
}
