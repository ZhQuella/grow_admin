import type { Component } from 'vue'
import type { CodeDependency, SandboxExpose } from '../types'

function pickRecord<T>(
  source: Record<string, T> | undefined,
  enabledNames: Set<string>,
): Record<string, T> {
  if (!source) return {}
  const result: Record<string, T> = {}
  Object.keys(source).forEach((key) => {
    if (enabledNames.has(key)) {
      result[key] = source[key]!
    }
  })
  return result
}

function isActive(item: CodeDependency) {
  return item.locked === true || item.enabled !== false
}

/**
 * 按依赖勾选结果裁剪 expose。
 * - 组件：宿主全局组件始终可用（模板直接写 Grow*）；勾选的 component 依赖可额外补充
 * - API：勾选后注入 script（locked 项始终注入）
 * - modules：包名模块，支持 import
 */
export function resolveActiveExpose(
  expose: SandboxExpose,
  dependencies: CodeDependency[] = [],
  hostComponents: Record<string, Component> = {},
): SandboxExpose {
  if (!dependencies.length) {
    return {
      components: {
        ...hostComponents,
        ...(expose.components ?? {}),
      },
      apis: { ...(expose.apis ?? {}) },
      utils: { ...(expose.utils ?? {}) },
      modules: { ...(expose.modules ?? {}) },
    }
  }

  const enabled = dependencies.filter(isActive)
  const enabledNames = new Set(enabled.map((item) => item.name))

  const components: Record<string, Component> = {
    ...hostComponents,
    ...pickRecord(expose.components, enabledNames),
  }

  enabled.forEach((item) => {
    if (item.kind && item.kind !== 'component') return
    if (components[item.name]) return

    const fromValue = item.value as Component | undefined
    const fromHost = hostComponents[item.name]
    const comp = fromValue || fromHost
    if (comp) {
      components[item.name] = comp
    }
  })

  return {
    components,
    apis: pickRecord(expose.apis, enabledNames),
    utils: pickRecord(expose.utils, enabledNames),
    modules: pickRecord(expose.modules, enabledNames),
  }
}

/** 从 expose 生成依赖目录（供 GrowCodeDeps 展示） */
export function createDependencyCatalog(expose: SandboxExpose): CodeDependency[] {
  const list: CodeDependency[] = []

  Object.keys(expose.components ?? {}).forEach((name) => {
    list.push({
      name,
      source: 'host',
      kind: 'component',
      enabled: true,
      value: expose.components?.[name],
    })
  })

  Object.keys(expose.apis ?? {}).forEach((name) => {
    list.push({
      name,
      source: 'host',
      kind: 'api',
      enabled: true,
      value: expose.apis?.[name],
    })
  })

  Object.keys(expose.utils ?? {}).forEach((name) => {
    list.push({
      name,
      source: 'host',
      kind: 'util',
      enabled: true,
      value: expose.utils?.[name],
    })
  })

  Object.keys(expose.modules ?? {}).forEach((name) => {
    list.push({
      name,
      source: 'host',
      kind: 'util',
      enabled: true,
      value: expose.modules?.[name],
    })
  })

  return list
}
