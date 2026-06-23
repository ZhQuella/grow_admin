import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { WorkspaceMenuApiItem } from '@grow-admin-cornerstone/apps-workspace/route-config'

/** 模拟接口返回的菜单展示数据（title、icon 由后端控制） */
export const MENU_LIST: WorkspaceMenuApiItem[] = [
  {
    name: 'WorkspaceCatalog',
    title: '工作区',
    icon: 'ant-design:folder-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    children: [
      {
        name: 'Workspace',
        title: '工作台',
        icon: 'ant-design:appstore-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        defaultShow: true,
        affix: true,
      },
      {
        name: 'WorkspaceSettings',
        title: '设置中心',
        icon: 'ant-design:setting-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: false,
      },
    ],
  },
]
