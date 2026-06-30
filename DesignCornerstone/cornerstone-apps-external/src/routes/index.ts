import { EmbedPage } from '@grow-admin-rock/layouts/embed-page'
import type { ExternalRouteConfig } from './config'

const EXTERNAL_COMPONENTS: Record<string, GrowRouteComponent> = {
  EmbedPage: () => Promise.resolve({ default: EmbedPage }),
}

function resolveExternalComponent(config: ExternalRouteConfig): GrowRouteComponent {
  const componentKey = config.componentKey
  if (!componentKey) {
    throw new Error(`External route "${config.name}" is missing componentKey`)
  }
  const component = EXTERNAL_COMPONENTS[componentKey]
  if (!component) {
    throw new Error(`Unknown external component: ${componentKey}`)
  }
  return component
}

export function resolveExternalRoute(
  config: ExternalRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  return {
    path: fullPath,
    name: config.name,
    component: resolveExternalComponent(config),
    meta: {
      title: config.title,
      isExternalPage: config.isExternalPage,
      openMode: config.openMode,
      link: config.link,
    },
    icon: config.icon,
  }
}

export * from './config'
export { mergeExternalMenuWithStructure } from './mergeMenu'
