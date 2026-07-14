import { MenuModeEnum, MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { RouteMeta } from 'vue-router'

export interface MenuTag {
  type?: 'primary' | 'error' | 'warn' | 'success'
  content?: string
  dot?: boolean
}

export interface Menu {
  name: string
  // 菜单展示名 || i8n
  title: string

  icon?: string

  path: string

  // path contains param, auto assignment.
  paramPath?: string

  disabled?: boolean

  children?: Menu[]

  orderNo?: number

  meta?: Partial<RouteMeta>

  tag?: MenuTag

  menuType: MenuTypeEnum

  isVisible: boolean

  /** 是否缓存页面，默认 true */
  isKeepAlive?: boolean

  /** 是否固定标签，不可关闭 */
  affix?: boolean

  /** 是否默认在视图区域展示（首次无 tab 时自动打开并跳转） */
  defaultShow?: boolean

  /** 菜单排序，值越小越靠前 */
  sort?: number

  /** 是否外部页面 */
  isExternalPage?: boolean

  /** 页面打开方式 */
  openMode?: PageOpenModeEnum

  /** 外部页面链接（iframe 内嵌与浏览器打开共用） */
  link?: string

  label?: Node | JSX.Element | string

  key?: string | number | Symbol
}

export interface MenuModule {
  orderNo?: number
  menu: Menu
}
