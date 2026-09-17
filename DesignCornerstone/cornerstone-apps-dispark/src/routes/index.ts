import { PageOpenModeEnum } from '@grow-admin-rock/constants'

export const DisparkPageTypeEnum = {
  SANDBOX: 'sandbox',
  LOWCODE: 'lowcode',
  REPORT: 'report',
} as const

export type DisparkPageType = typeof DisparkPageTypeEnum[keyof typeof DisparkPageTypeEnum]

export type DisparkRouteConfig = {
  path: string
  name: string | symbol
  title: string
  icon?: string
  pageType?: DisparkPageType
  openMode?: PageOpenModeEnum
  link?: string
}

const DISPARK_PAGE_COMPONENTS: Record<DisparkPageType, GrowRouteComponent> = {
  [DisparkPageTypeEnum.SANDBOX]: () => import('../pages/automation-sandbox-page.vue'),
  [DisparkPageTypeEnum.LOWCODE]: () => import('../pages/automation-lowcode-page.vue'),
  [DisparkPageTypeEnum.REPORT]: () => import('../pages/automation-report-page.vue'),
}

const IFRAME_PAGE_COMPONENT: GrowRouteComponent = () => import('../pages/iframe-page.vue')

export function resolveDisparkComponent(
  config: Pick<DisparkRouteConfig, 'pageType' | 'openMode'>,
): GrowRouteComponent | undefined {
  if (config.openMode === PageOpenModeEnum.IFRAME) {
    return IFRAME_PAGE_COMPONENT
  }
  if (config.pageType) {
    return DISPARK_PAGE_COMPONENTS[config.pageType]
  }
  return undefined
}

export function resolveDisparkRoute(
  config: DisparkRouteConfig,
  fullPath = config.path,
): RouteRecordItem {
  const component = resolveDisparkComponent(config)
  if (!component) {
    throw new Error(`Unsupported dispark route: ${String(config.name)}`)
  }

  return {
    path: fullPath,
    name: config.name,
    component,
    meta: {
      title: config.title,
      openMode: config.openMode,
      link: config.link,
    },
    icon: config.icon,
  }
}
