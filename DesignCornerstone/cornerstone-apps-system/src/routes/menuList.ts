import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuApiItem } from './config'

export const SYSTEM_MENU_LIST: SystemMenuApiItem[] = [
  {
    name: 'SystemCatalog',
    title: '系统管理',
    icon: 'ant-design:setting-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 25,
    children: [
      {
        name: 'MenuManage',
        title: '菜单管理',
        icon: 'ant-design:menu-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
    ],
  },
]
