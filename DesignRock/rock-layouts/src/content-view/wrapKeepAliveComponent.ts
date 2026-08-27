import { defineComponent, h, isVNode, type Component, type VNode } from 'vue'

/** 按 cacheName 缓存组件类型，保证 keep-alive include 匹配到同一引用 */
const resolvedComponents = new Map<string, Component>()

function componentTypeName(type: unknown): string {
  if (type == null || typeof type === 'string' || typeof type === 'symbol') {
    return ''
  }
  if (typeof type === 'function') {
    const fn = type as { displayName?: string, name?: string }
    return fn.displayName || fn.name || ''
  }
  const obj = type as { name?: string, __name?: string }
  return obj.name || obj.__name || ''
}

function stampKeepAliveName(component: Component, cacheName: string): Component {
  if (typeof component === 'function') {
    return defineComponent({
      name: cacheName,
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h(component as Component, attrs, slots)
      },
    })
  }

  return {
    ...(component as object),
    name: cacheName,
    __name: cacheName,
  } as Component
}

function resolveNamedType(inner: Component, cacheName: string): Component {
  const cached = resolvedComponents.get(cacheName)
  if (cached) {
    return cached
  }
  const stamped = stampKeepAliveName(inner, cacheName)
  resolvedComponents.set(cacheName, stamped)
  return stamped
}

/**
 * 继续使用 router-view 给出的 VNode（官方 keep-alive 用法），只在 type.name
 * 与 include 不一致时换成稳定的具名类型。不要 cloneVNode，也不要每次 h() 新节点。
 */
export function wrapKeepAliveComponent(
  component: Component | VNode,
  cacheName: string,
): Component | VNode {
  if (isVNode(component)) {
    const inner = component.type as Component
    if (typeof inner === 'string' || typeof inner === 'symbol' || inner == null) {
      return component
    }
    if (componentTypeName(inner) !== cacheName) {
      component.type = resolveNamedType(inner, cacheName)
    }
    return component
  }

  if (componentTypeName(component) === cacheName) {
    return component
  }
  return resolveNamedType(component, cacheName)
}
