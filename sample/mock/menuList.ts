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
      },
      {
        name: 'Analysis',
        title: '分析页面',
        icon: 'ant-design:line-chart-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
      },
    ],
  },
]
