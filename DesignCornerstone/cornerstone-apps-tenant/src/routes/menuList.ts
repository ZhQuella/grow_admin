import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { TenantMenuApiItem } from './config'

export const TENANT_MENU_LIST: TenantMenuApiItem[] = [
  {
    name: 'TenantCatalog',
    title: '租户管理',
    icon: 'ant-design:bank-outlined',
    menuType: MenuTypeEnum.DIRECTORY,
    isVisible: true,
    sort: 38,
    children: [
      {
        name: 'TenantManage',
        title: '租户管理',
        icon: 'ant-design:bank-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 10,
      },
      {
        name: 'TenantMenu',
        title: '租户菜单',
        icon: 'ant-design:menu-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 15,
      },
      {
        name: 'TenantAdminRole',
        title: '租户角色',
        icon: 'ant-design:crown-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 20,
      },
      {
        name: 'TenantAccount',
        title: '租户账号',
        icon: 'ant-design:usergroup-add-outlined',
        menuType: MenuTypeEnum.MENU,
        isVisible: true,
        isKeepAlive: true,
        sort: 30,
      },
    ],
  },
]
