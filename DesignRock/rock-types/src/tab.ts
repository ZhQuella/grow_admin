import { PageOpenModeEnum } from '@grow-admin-rock/constants'

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
}
