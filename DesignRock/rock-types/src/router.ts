import type { RouteRecordRaw, RouteComponent, RouteMeta } from 'vue-router'

export type Lazy<T> = () => Promise<T>

export type GrowRouteComponent = RouteComponent | Lazy<RouteComponent> ;

export type RouteRecordItem = RouteRecordRaw & {
  path: string
  name: string
  meta: RouteMeta
  icon?: string
  children?: RouteRecordItem[]
  component?: GrowRouteComponent
}
