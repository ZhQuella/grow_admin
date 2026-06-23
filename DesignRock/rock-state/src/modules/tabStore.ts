import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { Menu, TabItem, TabSubPage } from '@grow-admin-rock/types'
import { resolveTabCacheName } from '../tabCacheUtils'

export interface TabStoreState {
  tabList: TabItem[]
  activeTab: string
  cacheIncludeList: string[]
  pageReloadKeys: Record<string, number>
  /** setTab 早于 tab 创建时的待应用标题 */
  pendingTabTitles: Record<string, string>
  /** setTab 早于子页面创建时的待应用标题 */
  pendingSubPageTitles: Record<string, string>
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

function findMenuByName(menus: Menu[], name: string): Menu | null {
  for (const menu of menus) {
    if (menu.name === name) {
      return menu
    }
    if (menu.children?.length) {
      const matched = findMenuByName(menu.children, name)
      if (matched) {
        return matched
      }
    }
  }
  return null
}

function getBaseComponentName(cacheName: string): string {
  const separatorIndex = cacheName.indexOf('__')
  return separatorIndex === -1 ? cacheName : cacheName.slice(0, separatorIndex)
}

function migrateTabCacheNames(tabList: TabItem[]) {
  tabList.forEach((tab) => {
    tab.name = resolveTabCacheName(tab.fullPath, getBaseComponentName(tab.name))
    tab.subPages?.forEach((subPage) => {
      subPage.name = resolveTabCacheName(subPage.fullPath, getBaseComponentName(subPage.name))
    })
  })
}

function toTabItem(menu: Menu): TabItem {
  const fullPath = normalizePath(menu.path)
  return {
    fullPath,
    title: menu.title,
    name: resolveTabCacheName(fullPath, menu.name),
    icon: menu.icon,
    affix: menu.affix ?? false,
    isKeepAlive: menu.isKeepAlive ?? true,
    isExternalPage: menu.isExternalPage,
    openMode: menu.openMode,
    link: menu.link,
    subPages: [],
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
    pendingTabTitles: {},
    pendingSubPageTitles: {},
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

    removeCacheForSubPage(subPage: TabSubPage) {
      if (subPage.isKeepAlive === false) {
        return
      }
      this.removeCache(subPage.name)
    },

    clearTabResources(tab: TabItem) {
      tab.subPages?.forEach((subPage) => {
        this.removeCacheForSubPage(subPage)
        delete this.pageReloadKeys[subPage.fullPath]
      })
      this.removeCacheForTab(tab)
      delete this.pageReloadKeys[tab.fullPath]
    },

    findParentTabBySubPage(fullPath: string): TabItem | null {
      const normalizedPath = normalizePath(fullPath)
      return this.tabList.find((tab) =>
        tab.subPages?.some((subPage) => subPage.fullPath === normalizedPath),
      ) ?? null
    },

    isSubPageOfTab(tab: TabItem, subPageFullPath: string): boolean {
      const normalizedPath = normalizePath(subPageFullPath)
      return tab.subPages?.some((subPage) => subPage.fullPath === normalizedPath) ?? false
    },

    isViewingSubPage(fullPath: string): boolean {
      return this.findParentTabBySubPage(fullPath) != null
    },

    getSubPageTitle(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const parentTab = this.findParentTabBySubPage(normalizedPath)
      const subPage = parentTab?.subPages?.find((item) => item.fullPath === normalizedPath)
      if (subPage?.title) {
        return subPage.title
      }
      return this.pendingSubPageTitles[normalizedPath] ?? null
    },

    getTabDisplayTitle(tab: TabItem, currentFullPath: string): string {
      const normalizedPath = normalizePath(currentFullPath)
      const subPage = tab.subPages?.find((item) => item.fullPath === normalizedPath)
      if (subPage) {
        return subPage.title
      }
      const pendingSubPageTitle = this.pendingSubPageTitles[normalizedPath]
      if (pendingSubPageTitle) {
        return pendingSubPageTitle
      }
      return tab.title
    },

    rebuildCacheList() {
      const names = new Set<string>()
      for (const tab of this.tabList) {
        if (tab.isKeepAlive !== false) {
          names.add(tab.name)
        }
        tab.subPages?.forEach((subPage) => {
          if (subPage.isKeepAlive !== false) {
            names.add(subPage.name)
          }
        })
      }
      this.cacheIncludeList = [...names]
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
        if (!existing.subPages) {
          existing.subPages = []
        }
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

    prepareStackSubPage(params: {
      parentName: string
      subPage: TabSubPage
      menus: Menu[]
    }): string | null {
      const parentMenu = findMenuByName(params.menus, params.parentName)
      if (!parentMenu) {
        return null
      }

      const parentTab = this.openTab(parentMenu)
      if (!parentTab.subPages) {
        parentTab.subPages = []
      }

      const subPageFullPath = normalizePath(params.subPage.fullPath)
      const pendingTitle = this.pendingSubPageTitles[subPageFullPath]
      const existingSubPage = parentTab.subPages.find((item) => item.fullPath === subPageFullPath)
      if (existingSubPage) {
        if (pendingTitle) {
          existingSubPage.title = pendingTitle
          delete this.pendingSubPageTitles[subPageFullPath]
        } else if (params.subPage.title) {
          existingSubPage.title = params.subPage.title
        }
      } else {
        parentTab.subPages.push({
          ...params.subPage,
          fullPath: subPageFullPath,
          title: pendingTitle ?? params.subPage.title,
          name: resolveTabCacheName(subPageFullPath, params.subPage.name),
        })
        if (pendingTitle) {
          delete this.pendingSubPageTitles[subPageFullPath]
        }
        if (params.subPage.isKeepAlive !== false) {
          this.addCache(resolveTabCacheName(subPageFullPath, params.subPage.name))
        }
      }

      parentTab.lastSubPagePath = subPageFullPath
      this.activeTab = parentTab.fullPath
      return parentTab.fullPath
    },

    syncStackSubPage(fullPath: string) {
      const normalizedPath = normalizePath(fullPath)
      const parentTab = this.findParentTabBySubPage(normalizedPath)
      if (!parentTab) {
        return
      }

      const subPage = parentTab.subPages?.find((item) => item.fullPath === normalizedPath)
      const pendingTitle = this.pendingSubPageTitles[normalizedPath]
      if (subPage && pendingTitle) {
        subPage.title = pendingTitle
        delete this.pendingSubPageTitles[normalizedPath]
      }

      parentTab.lastSubPagePath = normalizedPath
      this.activeTab = parentTab.fullPath
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

      this.clearTabResources(tab)
      this.tabList.splice(index, 1)

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

    closeSubPage(parentFullPath: string, subPageFullPath: string): string {
      const normalizedParentPath = normalizePath(parentFullPath)
      const normalizedSubPagePath = normalizePath(subPageFullPath)
      const tab = this.tabList.find((item) => item.fullPath === normalizedParentPath)
      if (!tab?.subPages?.length) {
        return normalizedParentPath
      }

      const subPageIndex = tab.subPages.findIndex((item) => item.fullPath === normalizedSubPagePath)
      if (subPageIndex < 0) {
        return normalizedParentPath
      }

      const [subPage] = tab.subPages.splice(subPageIndex, 1)
      if (subPage) {
        this.removeCacheForSubPage(subPage)
        delete this.pageReloadKeys[subPage.fullPath]
      }

      if (tab.lastSubPagePath === normalizedSubPagePath) {
        tab.lastSubPagePath = tab.subPages[tab.subPages.length - 1]?.fullPath
      }

      return normalizedParentPath
    },

    closeRightTabs(fullPath: string): string | null {
      const normalizedPath = normalizePath(fullPath)
      const index = this.tabList.findIndex((tab) => tab.fullPath === normalizedPath)
      if (index < 0) {
        return null
      }

      const toClose = this.tabList.slice(index + 1).filter((tab) => !tab.affix)
      toClose.forEach((tab) => {
        this.clearTabResources(tab)
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
        this.clearTabResources(tab)
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
        this.clearTabResources(tab)
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
        this.clearTabResources(tab)
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

    refreshSubPage(subPageFullPath: string) {
      const normalizedPath = normalizePath(subPageFullPath)
      const parentTab = this.findParentTabBySubPage(normalizedPath)
      const subPage = parentTab?.subPages?.find((item) => item.fullPath === normalizedPath)
      if (!subPage) {
        return
      }

      this.removeCacheForSubPage(subPage)
      this.pageReloadKeys[normalizedPath] = (this.pageReloadKeys[normalizedPath] ?? 0) + 1

      if (subPage.isKeepAlive !== false) {
        nextTick(() => {
          this.addCache(subPage.name)
        })
      }
    },

    openDynamicTab(tab: Pick<TabItem, 'fullPath' | 'name' | 'title' | 'isKeepAlive'>): TabItem {
      const fullPath = normalizePath(tab.fullPath)
      const cacheName = resolveTabCacheName(fullPath, tab.name)
      const pendingTitle = this.pendingTabTitles[fullPath]
      const existing = this.tabList.find((item) => item.fullPath === fullPath)
      if (existing) {
        if (pendingTitle) {
          existing.title = pendingTitle
          delete this.pendingTabTitles[fullPath]
        }
        this.activeTab = fullPath
        return existing
      }

      const newTab: TabItem = {
        fullPath,
        title: pendingTitle ?? tab.title,
        name: cacheName,
        isKeepAlive: tab.isKeepAlive ?? true,
        subPages: [],
      }
      if (pendingTitle) {
        delete this.pendingTabTitles[fullPath]
      }
      this.tabList.push(newTab)
      if (newTab.isKeepAlive !== false) {
        this.addCache(newTab.name)
      }
      this.activeTab = fullPath
      return newTab
    },

    setTabTitle(fullPath: string, title: string) {
      if (!title || title.includes('undefined')) {
        return
      }
      const normalizedPath = normalizePath(fullPath)
      const parentTab = this.findParentTabBySubPage(normalizedPath)
      if (parentTab) {
        const subPage = parentTab.subPages?.find((item) => item.fullPath === normalizedPath)
        if (subPage) {
          subPage.title = title
          delete this.pendingSubPageTitles[normalizedPath]
          return
        }
        this.pendingSubPageTitles[normalizedPath] = title
        return
      }

      const tab = this.tabList.find((item) => item.fullPath === normalizedPath)
      if (tab) {
        tab.title = title
        delete this.pendingTabTitles[normalizedPath]
        delete this.pendingSubPageTitles[normalizedPath]
        return
      }

      this.pendingSubPageTitles[normalizedPath] = title
      this.pendingTabTitles[normalizedPath] = title
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
      this.pendingTabTitles = {}
      this.pendingSubPageTitles = {}
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['tabList', 'activeTab'],
    afterRestore: (ctx) => {
      ctx.store.tabList.forEach((tab: TabItem) => {
        if (!tab.subPages) {
          tab.subPages = []
        }
      })
      migrateTabCacheNames(ctx.store.tabList)
      ctx.store.rebuildCacheList()
    },
  },
})
