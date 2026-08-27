import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuApiItem } from './config'

export const SYSTEM_MENU_LIST: SystemMenuApiItem[] = [
  {
    name: 'SystemCatalog',
    title: '系统管理',
    icon: 'ant-design:setting-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 37,
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
      {
        name: 'RoleManage',
        title: '角色管理',
        icon: 'ant-design:team-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
      {
        name: 'PersonManage',
        title: '人员管理',
        icon: 'ant-design:user-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 30,
        children: [
          {
            name: 'PersonCreate',
            title: '新增人员',
            icon: 'ant-design:user-add-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: false,
            isKeepAlive: false,
            sort: 10,
          },
          {
            name: 'PersonEdit',
            title: '编辑人员',
            icon: 'ant-design:edit-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: false,
            isKeepAlive: false,
            sort: 20,
          },
          {
            name: 'PersonDetail',
            title: '人员详情',
            icon: 'ant-design:profile-outlined',
            menuType: MenuTypeEnum.MENU,
            isVisible: false,
            isKeepAlive: false,
            sort: 30,
          },
        ],
      },
    ],
  },
]
