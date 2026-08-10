import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { DesignerMenuApiItem } from './config'

export const DESIGNER_MENU_LIST: DesignerMenuApiItem[] = [
  {
    name: 'DesignerCatalog',
    title: '设计器',
    icon: 'ant-design:appstore-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 36,
    children: [
      {
        name: 'DesignerPlayground',
        title: '低代码设计器',
        icon: 'ant-design:build-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
      {
        name: 'ReportDesignerPlayground',
        title: '报表设计器',
        icon: 'ant-design:bar-chart-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
      {
        name: 'SchemaDesignerPlayground',
        title: '数据库建模',
        icon: 'ant-design:database-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 30,
      },
      {
        name: 'DataPrepPlayground',
        title: '数据准备',
        icon: 'ant-design:partition-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 40,
      },
      {
        name: 'DataCleanPlayground',
        title: '数据清洗',
        icon: 'ant-design:clear-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 50,
      },
    ],
  },
]
