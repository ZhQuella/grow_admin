import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { Menu, TabItem } from '@grow-admin-rock/types'

export interface TabStoreState {
  tabList: TabItem[]
  activeTab: string
  cacheIncludeList: string[]
  pageReloadKeys: Record<string, number>
}

export type TabStore = ReturnType<typeof useTabStore>

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

function findMenuByPath(menus: Menu[], fullPath: string): Menu | null {
  const normalizedPath = normalizePath(fullPath)

  for (const menu of menus) {
    if (menu.path.startsWith('/') && normalizePath(menu.path) === normalizedPath) {
      return menu
    }
    if (menu.children?.length) {
      const matched = findMenuByPath(menu.children, normalizedPath)
      if (matched) {
        return matched
      }
    }
  }

  return null
}

function toTabItem(menu: Menu): TabItem {
  return {
    fullPath: normalizePath(menu.path),
    title: menu.title,
    name: menu.name,
    icon: menu.icon,
    affix: menu.affix ?? false,
    isKeepAlive: menu.isKeepAlive ?? true,
    isExternalPage: menu.isExternalPage,
    openMode: menu.openMode,
    link: menu.link,
  }
}

function collectDefaultShowMenus(menus: Menu[]): Menu[] {
  const result: Menu[] = []

  for (const menu of menus) {
    if (menu.children?.length) {
      result.push(...collectDefaultShowMenus(menu.children))
    }
    if (
      menu.menuType === MenuTypeEnum.MENU
      && menu.defaultShow
      && menu.path.startsWith('/')
      && menu.openMode !== PageOpenModeEnum.BROWSER
    ) {
      result.push(menu)
    }
  }

  return result
}

export const useTabStore = defineStore({
  id: 'TAB',
  state: (): TabStoreState => ({
    tabList: [],
    activeTab: '',
    cacheIncludeList: [],
    pageReloadKeys: {},
  }),
  getters: {
    getTabList: (state) => state.tabList,
    getActiveTab: (state) => state.activeTab,
    getCacheIncludeList: (state) => state.cacheIncludeList,
    getPageReloadKey: (state) => (fullPath: string) => state.pageReloadKeys[fullPath] ?? 0,
  },
  actions: {
    setActiveTab(fullPath: string) {
      this.activeTab = normalizePath(fullPath)
    },

    addCache(name: string) {
      if (!this.cacheIncludeList.includes(name)) {
        this.cacheIncludeList.push(name)
      }
    },

    removeCache(name: string) {
      const index = this.cacheIncludeList.indexOf(name)
      if (index > -1) {
        this.cacheIncludeList.splice(index, 1)
      }
    },

    removeCacheForTab(tab: TabItem) {
      if (tab.isKeepAlive === false) {
        return
      }
      this.removeCache(tab.name)
    },

    rebuildCacheList() {
      this.cacheIncludeList = this.tabList
        .filter((tab) => tab.isKeepAlive !== false)
        .map((tab) => tab.name)
    },

    syncTabTitlesFromMenus(menus: Menu[]) {
      this.tabList.forEach((tab) => {
        const menu = findMenuByPath(menus, tab.fullPath)
        if (menu) {
          tab.title = menu.title
          tab.icon = menu.icon
          tab.affix = menu.affix ?? false
          tab.isKeepAlive = menu.isKeepAlive ?? true
          tab.isExternalPage = menu.isExternalPage
          tab.openMode = menu.openMode
          tab.link = menu.link
        }
      })
    },

    /** 首次无 tab 时，打开 defaultShow 菜单并返回首选路由 */
    initDefaultTabs(menus: Menu[]): string | null {
      if (this.tabList.length > 0) {
        return null
      }

      const defaultMenus = collectDefaultShowMenus(menus)
      if (!defaultMenus.length) {
        return null
      }

      defaultMenus.forEach((menu) => {
        this.openTab(menu)
      })

      const firstPath = normalizePath(defaultMenus[0].path)
      this.activeTab = firstPath
      return firstPath
    },

    openTab(menu: Menu): TabItem {
      if (menu.menuType !== MenuTypeEnum.MENU || !menu.path.startsWith('/')) {
        return toTabItem(menu)
      }

      const fullPath = normalizePath(menu.path)
      const existing = this.tabList.find((tab) => tab.fullPath === fullPath)
      if (existing) {
        existing.title = menu.title
        existing.icon = menu.icon
        existing.affix = menu.affix ?? false
        existing.isKeepAlive = menu.isKeepAlive ?? true
        existing.isExternalPage = menu.isExternalPage
        existing.openMode = menu.openMode
        existing.link = menu.link
        this.activeTab = fullPath
        return existing
      }

      const tab = toTabItem(menu)
      this.tabList.push(tab)
      if (tab.isKeepAlive !== false) {
        this.addCache(tab.name)
      }
      this.activeTab = fullPath
      return tab
    },

    closeTab(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const index = this.tabList.findIndex((tab) => tab.fullPath === normalizedPath)
      if (index < 0) {
        return null
      }

      const tab = this.tabList[index]
      if (tab.affix) {
        return null
      }

      this.removeCacheForTab(tab)
      this.tabList.splice(index, 1)
      delete this.pageReloadKeys[normalizedPath]

      if (this.activeTab !== normalizedPath) {
        return null
      }

      const nextTab = this.tabList[index - 1] ?? this.tabList[0]
      if (!nextTab) {
        this.activeTab = ''
        return null
      }

      this.activeTab = nextTab.fullPath
      return nextTab.fullPath
    },

    closeRightTabs(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const index = this.tabList.findIndex((tab) => tab.fullPath === normalizedPath)
      if (index < 0) {
        return null
      }

      const toClose = this.tabList.slice(index + 1).filter((tab) => !tab.affix)
      toClose.forEach((tab) => {
        this.removeCacheForTab(tab)
        delete this.pageReloadKeys[tab.fullPath]
      })
      this.tabList = this.tabList.filter((tab, tabIndex) => tabIndex <= index || tab.affix)

      if (this.tabList.some((tab) => tab.fullPath === this.activeTab)) {
        return null
      }

      this.activeTab = normalizedPath
      return normalizedPath
    },

    closeLeftTabs(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const index = this.tabList.findIndex((tab) => tab.fullPath === normalizedPath)
      if (index < 0) {
        return null
      }

      const toClose = this.tabList.slice(0, index).filter((tab) => !tab.affix)
      toClose.forEach((tab) => {
        this.removeCacheForTab(tab)
        delete this.pageReloadKeys[tab.fullPath]
      })
      this.tabList = this.tabList.filter((tab, tabIndex) => tabIndex >= index || tab.affix)

      if (this.tabList.some((tab) => tab.fullPath === this.activeTab)) {
        return null
      }

      this.activeTab = normalizedPath
      return normalizedPath
    },

    closeOtherTabs(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const toClose = this.tabList.filter(
        (tab) => tab.fullPath !== normalizedPath && !tab.affix,
      )
      toClose.forEach((tab) => {
        this.removeCacheForTab(tab)
        delete this.pageReloadKeys[tab.fullPath]
      })
      this.tabList = this.tabList.filter(
        (tab) => tab.fullPath === normalizedPath || tab.affix,
      )
      this.activeTab = normalizedPath
      return normalizedPath
    },

    closeAllTabs(): string | null {
      const affixTabs = this.tabList.filter((tab) => tab.affix)
      const toClose = this.tabList.filter((tab) => !tab.affix)
      toClose.forEach((tab) => {
        this.removeCacheForTab(tab)
        delete this.pageReloadKeys[tab.fullPath]
      })
      this.tabList = affixTabs

      if (this.tabList.some((tab) => tab.fullPath === this.activeTab)) {
        return null
      }

      const nextTab = affixTabs[affixTabs.length - 1]
      if (!nextTab) {
        this.activeTab = ''
        return null
      }

      this.activeTab = nextTab.fullPath
      return nextTab.fullPath
    },

    refreshTab(fullPath: string) {
      const normalizedPath = normalizePath(fullPath)
      const tab = this.tabList.find((item) => item.fullPath === normalizedPath)
      if (!tab) {
        return
      }

      this.removeCacheForTab(tab)
      this.pageReloadKeys[normalizedPath] = (this.pageReloadKeys[normalizedPath] ?? 0) + 1

      if (tab.isKeepAlive !== false) {
        nextTick(() => {
          this.addCache(tab.name)
        })
      }
    },

    sortTabs(oldIndex: number, newIndex: number) {
      if (oldIndex === newIndex) {
        return
      }
      if (oldIndex < 0 || newIndex < 0) {
        return
      }
      if (oldIndex >= this.tabList.length || newIndex >= this.tabList.length) {
        return
      }

      const [moved] = this.tabList.splice(oldIndex, 1)
      if (!moved) {
        return
      }
      this.tabList.splice(newIndex, 0, moved)
    },

    resetState() {
      this.tabList = []
      this.activeTab = ''
      this.cacheIncludeList = []
      this.pageReloadKeys = {}
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['tabList', 'activeTab'],
    afterRestore: (ctx) => {
      ctx.store.rebuildCacheList()
    },
  },
})
