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
      {
        name: 'MenuSubsetTest',
        title: '菜单子集测试',
        icon: 'ant-design:experiment-outlined',
        menuType: MenuTypeEnum.DIRECTORY,
        isVisible: true,
        children: [
          {
            name: 'MenuChildTest',
            title: '菜单子集测试页',
            icon: 'ant-design:file-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: true,
            children: [
              {
                name: 'MenuChildTestSub',
                title: '菜单子集测试子页',
                icon: 'ant-design:file-text-outlined',
                menuType: MenuTypeEnum.MENU,
                isVisible: false,
              },
            ],
          },
        ],
      },
    ],
  },
]
