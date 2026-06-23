import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { FeatMenuApiItem } from '@grow-admin-cornerstone/apps-feat/route-config'

/** 模拟接口返回的功能示例菜单展示数据 */
export const FEAT_MENU_LIST: FeatMenuApiItem[] = [
  {
    name: 'FeatCatalog',
    title: '功能示例',
    icon: 'ant-design:experiment-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    children: [
      {
        name: 'OpenSubpage',
        title: '标签页操作示例',
        icon: 'ant-design:tags-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
      },
    ],
  },
]
