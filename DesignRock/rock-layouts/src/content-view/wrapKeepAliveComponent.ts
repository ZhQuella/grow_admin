import { defineComponent, h, shallowRef, type Component, type VNode } from 'vue'

type LazyComponentModule = {
  default: Component
}

/** 按 cacheName 缓存 wrapper，保证 keep-alive 识别稳定的组件类型 */
const resolvedComponents = new Map<string, Component>()

/**
 * 以固定 name 的同步组件包装路由页面，供 keep-alive include 匹配。
 * 异步页面作为子节点渲染；wrapper 实例被 keep-alive 缓存时，子页面状态一并保留。
 */
export function wrapKeepAliveComponent(
  component: Component,
  cacheName: string,
): Component {
  const cached = resolvedComponents.get(cacheName)
  if (cached) {
    return cached
  }

  const wrapped = defineComponent({
    name: cacheName,
    setup(props) {
      const innerComponent = shallowRef<Component | null>(null)

      if (typeof component === 'function') {
        const loader = component as () => Promise<LazyComponentModule>
        void loader().then((mod) => {
          innerComponent.value = mod.default
        })
      }
      else {
        innerComponent.value = component
      }

      return (): VNode | null => {
        if (!innerComponent.value) {
          return null
        }
        return h(innerComponent.value, props)
      }
    },
  })

  resolvedComponents.set(cacheName, wrapped)
  return wrapped
}
