import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { FeatMenuApiItem } from './config'

/**
 * 前端菜单展示信息（title / icon / 可见性等），与后端菜单字段对齐。
 * BACK 模式 mock、FRONT 模式 toFeatRouteConfigs 共用此数据源。
 */
export const FEAT_MENU_LIST: FeatMenuApiItem[] = [
  {
    name: 'FeatCatalog',
    title: '功能示例',
    icon: 'ant-design:experiment-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 20,
    children: [
      {
        name: 'SharedDemo',
        title: '共享页面',
        icon: 'ant-design:copy-outlined',
        menuType: MenuTypeEnum.DIRECTORY,
        isVisible: true,
        sort: 10,
        children: [
          {
            name: 'SharedDemoA',
            title: '共享页面 A',
            icon: 'ant-design:copy-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: true,
            isKeepAlive: true,
            sort: 10,
          },
          {
            name: 'SharedDemoB',
            title: '共享页面 B',
            icon: 'ant-design:copy-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: true,
            isKeepAlive: true,
            sort: 20,
          },
        ],
      },
      {
        name: 'OpenSubpage',
        title: '标签页操作示例',
        icon: 'ant-design:tags-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
      {
        name: 'MenuChildTest',
        title: '菜单子集测试页',
        icon: 'ant-design:file-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        sort: 30,
        children: [
          {
            name: 'MenuChildTestSub',
            title: '菜单子集测试子页',
            icon: 'ant-design:file-text-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: false,
            sort: 10,
          },
        ],
      },
      {
        name: 'SplitPane',
        title: '分屏组件',
        icon: 'ant-design:column-width-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 40,
      },
      {
        name: 'DownExcel',
        title: '本地导出 Excel',
        icon: 'ant-design:file-excel-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 50,
      },
      {
        name: 'SearchBar',
        title: '高级搜索栏',
        icon: 'ant-design:search-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 60,
      },
      {
        name: 'ColumnBar',
        title: '表格列设置',
        icon: 'ant-design:table-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 70,
      },
    ],
  },
]

/** 仅前端注册的演示菜单（与后端 MixtureDemoCatalog 同名合集） */
export const FEAT_FRONT_ONLY_MENU_LIST: FeatMenuApiItem[] = [
  {
    name: 'MixtureDemoCatalog',
    title: '权限演示',
    icon: 'ant-design:safety-certificate-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 30,
    children: [
      {
        name: 'MixtureFrontDemo',
        title: '前端独有页面',
        icon: 'ant-design:laptop-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
    ],
  },
]
