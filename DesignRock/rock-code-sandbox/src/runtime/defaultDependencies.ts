import type { CodeDependency } from '../types'

/** 沙箱默认注入（锁定，不可取消 / 删除） */
export const DEFAULT_SANDBOX_DEPENDENCIES: CodeDependency[] = [
  {
    name: 'useRequest',
    source: 'host',
    kind: 'api',
    enabled: true,
    locked: true,
  },
  {
    name: '@grow-admin-rock/state',
    source: 'host',
    kind: 'util',
    enabled: true,
    locked: true,
  },
  {
    name: '@grow-admin-rock/middleware-router',
    source: 'host',
    kind: 'util',
    enabled: true,
    locked: true,
  },
  {
    name: '@grow-admin-rock/utils',
    source: 'host',
    kind: 'util',
    enabled: true,
    locked: true,
  },
  {
    name: '@grow-admin-rock/hooks',
    source: 'host',
    kind: 'util',
    enabled: true,
    locked: true,
  },
]

/** 合并默认锁定依赖与用户自定义依赖（默认项始终在前、始终锁定启用） */
export function mergeDependencies(
  defaults: CodeDependency[] = DEFAULT_SANDBOX_DEPENDENCIES,
  extras: CodeDependency[] = [],
): CodeDependency[] {
  const lockedDefaults = defaults.map((item) => ({
    ...item,
    locked: true,
    enabled: true,
  }))
  const lockedNames = new Set(lockedDefaults.map((item) => item.name))
  const rest = extras
    .filter((item) => !lockedNames.has(item.name))
    .map((item) => (item.locked ? { ...item, enabled: true } : item))
  return [...lockedDefaults, ...rest]
}

/** 规范化依赖列表：锁定项强制启用，并保证 defaults 始终存在 */
export function normalizeDependencies(
  list: CodeDependency[],
  defaults: CodeDependency[] = DEFAULT_SANDBOX_DEPENDENCIES,
): CodeDependency[] {
  return mergeDependencies(defaults, list)
}
