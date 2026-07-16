/** 沙箱虚拟文件表：key 为规范化路径，如 App.vue、utils.js、components/Foo.vue */
export type SandboxFiles = Record<string, string>

/** 只匹配 from 后的相对路径，避免跨多条 import 误吞 */
const RELATIVE_FROM_RE = /\bfrom\s+['"](\.[^'"]+)['"]/g

/** 去掉开头 ./ 与多余斜杠，统一为正斜杠路径 */
export function normalizeSandboxPath(path: string): string {
  let next = path.replace(/\\/g, '/').trim()
  next = next.replace(/^\.\//, '')
  next = next.replace(/\/+/g, '/')
  const parts: string[] = []
  next.split('/').forEach((seg) => {
    if (!seg || seg === '.') return
    if (seg === '..') {
      parts.pop()
      return
    }
    parts.push(seg)
  })
  return parts.join('/')
}

function dirname(path: string): string {
  const normalized = normalizeSandboxPath(path)
  const idx = normalized.lastIndexOf('/')
  return idx === -1 ? '' : normalized.slice(0, idx)
}

function joinPath(dir: string, rel: string): string {
  const base = dir ? `${dir}/${rel}` : rel
  return normalizeSandboxPath(base)
}

/** 解析相对路径到 files 中的真实 key */
export function resolveSandboxFile(
  fromFile: string,
  spec: string,
  files: SandboxFiles,
): string | null {
  if (!spec.startsWith('.')) return null
  const joined = joinPath(dirname(fromFile), spec)
  const candidates = [joined]
  if (!/\.(vue|js|mjs|cjs|ts)$/i.test(joined)) {
    candidates.push(`${joined}.vue`, `${joined}.js`)
  }
  for (const candidate of candidates) {
    if (candidate in files) return candidate
  }
  return null
}

/** 从源码提取相对路径 import（仅 from './x'） */
export function extractRelativeImports(source: string): string[] {
  const result: string[] = []
  const re = new RegExp(RELATIVE_FROM_RE.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const spec = match[1]
    if (spec) result.push(spec)
  }
  return result
}

/**
 * 将相对 from 路径改写为规范化虚拟路径（如 Foo.vue），便于 modules 查表。
 * 只替换路径字符串，不改写 import 子句，避免误伤其它 import。
 */
export function rewriteRelativeImportPaths(
  source: string,
  fromFile: string,
  files: SandboxFiles,
): string {
  return source.replace(new RegExp(RELATIVE_FROM_RE.source, 'g'), (full, spec: string) => {
    const resolved = resolveSandboxFile(fromFile, spec, files)
    if (!resolved) {
      throw new Error(`无法解析模块: ${spec} （自 ${fromFile}）`)
    }
    return `from ${JSON.stringify(resolved)}`
  })
}

/** 自入口收集可达文件（拓扑逆序：依赖在前） */
export function collectReachableFiles(entry: string, files: SandboxFiles): string[] {
  const entryPath = normalizeSandboxPath(entry)
  if (!(entryPath in files)) {
    throw new Error(`入口文件不存在: ${entry}`)
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const order: string[] = []

  const visit = (path: string) => {
    if (visited.has(path)) return
    if (visiting.has(path)) {
      throw new Error(`检测到循环依赖: ${path}`)
    }
    visiting.add(path)
    const source = files[path] ?? ''
    extractRelativeImports(source).forEach((spec) => {
      const resolved = resolveSandboxFile(path, spec, files)
      if (!resolved) {
        throw new Error(`无法解析模块: ${spec} （自 ${path}）`)
      }
      visit(resolved)
    })
    visiting.delete(path)
    visited.add(path)
    order.push(path)
  }

  visit(entryPath)
  return order
}

export function normalizeSandboxFiles(files: SandboxFiles): SandboxFiles {
  const result: SandboxFiles = {}
  Object.entries(files).forEach(([key, value]) => {
    result[normalizeSandboxPath(key)] = value
  })
  return result
}
