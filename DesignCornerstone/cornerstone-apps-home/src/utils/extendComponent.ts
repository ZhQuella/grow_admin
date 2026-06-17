import type { RouteComponent } from 'vue-router'

type LazyComponentModule = {
  default: Record<string, unknown>
}

type LazyRouteComponent = () => Promise<RouteComponent>

export function extendComponent<T extends Record<string, unknown>>(
  component: RouteComponent | LazyRouteComponent,
  options: T,
): RouteComponent | LazyRouteComponent {
  if (typeof component !== 'function') {
    return component
  }

  const loader = component as () => Promise<LazyComponentModule>

  return () =>
    loader().then((mod) => ({
      ...mod.default,
      ...options,
    }))
}
