import { PageOpenModeEnum } from '@grow-admin-rock/constants'

export type TabNavigateMode = 'newTab' | 'stack'

export interface GoTabOptions {
  tabMode?: TabNavigateMode
  parentName?: string
}

export interface TabSubPage {
  fullPath: string
  title: string
  name: string
  isKeepAlive?: boolean
}

export interface TabItem {
  fullPath: string
  title: string
  name: string
  icon?: string
  affix?: boolean
  isKeepAlive?: boolean
  /** 是否外部页面 */
  isExternalPage?: boolean
  /** 页面打开方式 */
  openMode?: PageOpenModeEnum
  /** 外部页面链接 */
  link?: string
  /** stack 模式下已打开的子页面 */
  subPages?: TabSubPage[]
  /** 离开该 tab 时若在子页则记下子页路径；在父页时为空。仅点 tab 时据此恢复 */
  lastSubPagePath?: string
}
