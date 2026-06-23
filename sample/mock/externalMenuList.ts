import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { ExternalMenuApiItem } from '@grow-admin-cornerstone/apps-external/route-config'

/** 外部页面演示菜单（由 apps-external 模块提供） */
export const EXTERNAL_MENU_LIST: ExternalMenuApiItem[] = [
  {
    name: 'ExternalPages',
    title: '外部页面',
    icon: 'ant-design:global-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    children: [
      {
        name: 'ElementPlusDoc',
        title: '组件文档(内嵌)',
        icon: 'ant-design:book-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isExternalPage: true,
        openMode: PageOpenModeEnum.IFRAME,
        link: 'https://element-plus.org/zh-CN/',
      },
      {
        name: 'GrowAdminDoc',
        title: '框架文档(内嵌)',
        icon: 'ant-design:read-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isExternalPage: true,
        openMode: PageOpenModeEnum.IFRAME,
        link: 'https://gadmin.top',
      },
      {
        name: 'ComponentDocument',
        title: '组件文档(外链)',
        icon: 'ant-design:link-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isExternalPage: true,
        openMode: PageOpenModeEnum.BROWSER,
        link: 'https://element-plus.org/zh-CN/',
      },
    ],
  },
]
