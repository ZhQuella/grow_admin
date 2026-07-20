/** Container 布局容器：常见页面布局预设（对齐 Element Plus Container 文档） */

export type PageLayoutMode =
  | 'header-main'
  | 'header-main-footer'
  | 'aside-main'
  | 'header-aside-main'
  | 'header-aside-main-footer'
  | 'aside-header-main'
  | 'aside-header-main-footer'

export const PAGE_LAYOUT_OPTIONS = [
  { label: '顶栏 + 主区域', value: 'header-main' },
  { label: '顶栏 + 主区域 + 底栏', value: 'header-main-footer' },
  { label: '侧边栏 + 主区域', value: 'aside-main' },
  { label: '顶栏 + 侧边栏 + 主区域', value: 'header-aside-main' },
  { label: '顶栏 + 侧边栏 + 主区域 + 底栏', value: 'header-aside-main-footer' },
  { label: '侧边栏 + 顶栏 + 主区域', value: 'aside-header-main' },
  { label: '侧边栏 + 顶栏 + 主区域 + 底栏', value: 'aside-header-main-footer' },
] as const

export const DEFAULT_PAGE_LAYOUT: PageLayoutMode = 'header-main'

export const layoutHasHeader = (layout: string | undefined) =>
  Boolean(layout && layout.includes('header'))

export const layoutHasAside = (layout: string | undefined) =>
  Boolean(layout && layout.includes('aside'))

export const layoutHasFooter = (layout: string | undefined) =>
  Boolean(layout && layout.includes('footer'))
