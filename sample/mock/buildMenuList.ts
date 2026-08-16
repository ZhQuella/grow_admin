import {
  mergeExternalMenuWithStructure,
  EXTERNAL_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-external/route-config'
import {
  mergeFeatMenuWithStructure,
  FEAT_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-feat/route-config'
import {
  mergeMenuWithStructure,
  WORKSPACE_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-workspace/route-config'
import {
  mergeSandboxMenuWithStructure,
  SANDBOX_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-sandbox/route-config'
import {
  mergeDesignerMenuWithStructure,
  DESIGNER_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-designer/route-config'
import {
  mergeSystemMenuWithStructure,
  SYSTEM_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-system/route-config'
import { MENU_LIST } from './menuList'
import { EXTERNAL_MENU_LIST } from './externalMenuList'
import { FEAT_MENU_LIST } from './featMenuList'
import { SANDBOX_MENU_LIST } from './sandboxMenuList'
import { DESIGNER_MENU_LIST } from './designerMenuList'
import { SYSTEM_MENU_LIST } from './systemMenuList'

/** 侧边栏 /menu/list 的静态合并结果，菜单管理页会再拷一份独立数据 */
export function buildBackMenuList() {
  return [
    ...mergeMenuWithStructure(MENU_LIST, WORKSPACE_ROUTE_STRUCTURES),
    ...mergeSandboxMenuWithStructure(SANDBOX_MENU_LIST, SANDBOX_ROUTE_STRUCTURES),
    ...mergeDesignerMenuWithStructure(DESIGNER_MENU_LIST, DESIGNER_ROUTE_STRUCTURES),
    ...mergeExternalMenuWithStructure(EXTERNAL_MENU_LIST, EXTERNAL_ROUTE_STRUCTURES),
    ...mergeFeatMenuWithStructure(FEAT_MENU_LIST, FEAT_ROUTE_STRUCTURES),
    ...mergeSystemMenuWithStructure(SYSTEM_MENU_LIST, SYSTEM_ROUTE_STRUCTURES),
  ]
}
