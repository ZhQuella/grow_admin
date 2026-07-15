import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SandboxMenuApiItem } from './config'

export const SANDBOX_MENU_LIST: SandboxMenuApiItem[] = [
  {
    name: 'SandboxCatalog',
    title: '沙箱',
    icon: 'ant-design:code-sandbox-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 35,
    children: [
      {
        name: 'SandboxOverview',
        title: '编辑器',
        icon: 'ant-design:code-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
    ],
  },
]
