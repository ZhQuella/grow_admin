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
        title: '沙箱工具',
        icon: 'ant-design:experiment-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
      {
        name: 'CodeSandboxDemo',
        title: '代码沙箱',
        icon: 'ant-design:code-sandbox-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 15,
      },
      {
        name: 'CodeEditorDemo',
        title: '代码编辑器',
        icon: 'ant-design:code-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
    ],
  },
]
