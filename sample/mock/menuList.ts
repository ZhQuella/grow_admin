import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { WorkspaceMenuApiItem } from '@grow-admin-cornerstone/apps-workspace/route-config'

/** 模拟接口返回的菜单展示数据（title、icon 由后端控制） */
export const MENU_LIST: WorkspaceMenuApiItem[] = [
  {
    name: 'DashboardCatalog',
    title: 'Dashboard',
    icon: 'ant-design:dashboard-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 10,
    children: [
      {
        name: 'DataReport',
        title: '数据报表',
        icon: 'ant-design:bar-chart-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        defaultShow: true,
        affix: true,
        sort: 10,
      },
      {
        name: 'Analysis',
        title: '分析页面',
        icon: 'ant-design:line-chart-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
    ],
  },
  {
    name: 'MixtureDemoCatalog',
    title: '权限演示',
    icon: 'ant-design:safety-certificate-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 30,
    children: [
      {
        name: 'MixtureBackDemo',
        title: '后端独有页面',
        icon: 'ant-design:database-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
    ],
  },
]
