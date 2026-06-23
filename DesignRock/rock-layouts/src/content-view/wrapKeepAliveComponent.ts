import type { Component } from 'vue'

type LazyComponentModule = {
  default: Record<string, unknown>
}

/** 按 cacheName 缓存，保证 keep-alive 识别稳定的组件类型 */
const resolvedComponents = new Map<string, Component>()

/**
 * 运行时覆盖组件 name，与 tabStore 的 resolveTabCacheName 对齐。
 * 采用 extendComponent 同款策略，避免 defineComponent 包装导致 keep-alive deactivate 报错。
 */
export function wrapKeepAliveComponent(
  component: Component,
  cacheName: string,
): Component {
  const cached = resolvedComponents.get(cacheName)
  if (cached) {
    return cached
  }

  let wrapped: Component

  if (typeof component === 'function') {
    const loader = component as () => Promise<LazyComponentModule>
    wrapped = () =>
      loader().then((mod) => ({
        ...mod.default,
        name: cacheName,
        __name: cacheName,
      }))
  } else {
    wrapped = {
      ...(component as Record<string, unknown>),
      name: cacheName,
      __name: cacheName,
    } as Component
  }

  resolvedComponents.set(cacheName, wrapped)
  return wrapped
}
