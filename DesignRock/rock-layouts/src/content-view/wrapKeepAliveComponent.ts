import { cloneVNode, defineComponent, h, isVNode, type Component, type VNode } from 'vue'

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
 * router-view 插槽里的 Component 是 VNode，keep-alive 按 vnode.type 的 name 匹配 include。
 * 列表页注册时 extendComponent 已经改过 type.name；带 :id 的编辑页必须在这里改 type。
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
    if (componentTypeName(inner) === cacheName) {
      return component
    }
    const cloned = cloneVNode(component)
    cloned.type = resolveNamedType(inner, cacheName)
    return cloned
  }

  if (componentTypeName(component) === cacheName) {
    return component
  }
  return resolveNamedType(component, cacheName)
}
