import type { TabItem } from '@grow-admin-rock/types'

export type TabContextAction = 'reload' | 'close' | 'closeLeft' | 'closeRight' | 'closeOther' | 'closeAll'

export type TabContextMenuItem = {
  action: TabContextAction
  label: string
  icon: string
  disabled: boolean
  divided: boolean
}

export type TabContextMenuOptions = {
  isViewingSubPage?: boolean
}

const TAB_CONTEXT_MENU_META: Record<TabContextAction, { label: string; icon: string }> = {
  reload: { label: '重新加载', icon: 'ant-design:reload-outlined' },
  close: { label: '关闭标签', icon: 'ant-design:close-outlined' },
  closeRight: { label: '关闭右侧标签', icon: 'ant-design:vertical-left-outlined' },
  closeLeft: { label: '关闭左侧标签', icon: 'ant-design:vertical-right-outlined' },
  closeOther: { label: '关闭其他标签', icon: 'ant-design:minus-square-outlined' },
  closeAll: { label: '关闭所有标签', icon: 'ant-design:close-circle-outlined' },
}

const TAB_CONTEXT_MENU_ORDER: TabContextAction[] = [
  'reload',
  'close',
  'closeRight',
  'closeLeft',
  'closeOther',
  'closeAll',
]

const DIVIDED_ACTIONS = new Set<TabContextAction>(['closeRight', 'closeOther'])

function isActionDisabled(
  action: TabContextAction,
  tab: TabItem,
  tabList: TabItem[],
  currentIndex: number,
  options: TabContextMenuOptions,
): boolean {
  switch (action) {
    case 'reload':
      return false
    case 'close':
      return tab.affix ?? false
    case 'closeLeft':
      if (options.isViewingSubPage) {
        return true
      }
      return !tabList.slice(0, currentIndex).some((item) => !item.affix)
    case 'closeRight':
      if (options.isViewingSubPage) {
        return true
      }
      return !tabList.slice(currentIndex + 1).some((item) => !item.affix)
    case 'closeOther':
      return !tabList.some((item) => item.fullPath !== tab.fullPath && !item.affix)
    case 'closeAll':
      return !tabList.some((item) => !item.affix)
  }
}

export function buildTabContextMenuItems(
  tab: TabItem,
  tabList: TabItem[],
  options: TabContextMenuOptions = {},
): TabContextMenuItem[] {
  const currentIndex = tabList.findIndex((item) => item.fullPath === tab.fullPath)

  return TAB_CONTEXT_MENU_ORDER.map((action) => {
    const meta = TAB_CONTEXT_MENU_META[action]
    return {
      action,
      label: meta.label,
      icon: meta.icon,
      disabled: isActionDisabled(action, tab, tabList, currentIndex, options),
      divided: DIVIDED_ACTIONS.has(action),
    }
  })
}
