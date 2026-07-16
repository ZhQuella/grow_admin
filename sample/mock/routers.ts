import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  mergeExternalMenuWithStructure,
  EXTERNAL_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-external/route-config';
import {
  mergeFeatMenuWithStructure,
  FEAT_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-feat/route-config';
import {
  mergeMenuWithStructure,
  WORKSPACE_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-workspace/route-config';
import {
  mergeSandboxMenuWithStructure,
  SANDBOX_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-sandbox/route-config';
import {
  mergeDesignerMenuWithStructure,
  DESIGNER_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-designer/route-config';
import { resultSuccess } from '@grow-admin-rock/mock/util';
import { MENU_LIST } from './menuList';
import { EXTERNAL_MENU_LIST } from './externalMenuList';
import { FEAT_MENU_LIST } from './featMenuList';
import { SANDBOX_MENU_LIST } from './sandboxMenuList';
import { DESIGNER_MENU_LIST } from './designerMenuList';

export default [
  {
    url: mockUrl('/menu/list'),
    method: "get",
    response: () => {
      return resultSuccess({
        menuList: [
          ...mergeMenuWithStructure(MENU_LIST, WORKSPACE_ROUTE_STRUCTURES),
          ...mergeSandboxMenuWithStructure(SANDBOX_MENU_LIST, SANDBOX_ROUTE_STRUCTURES),
          ...mergeDesignerMenuWithStructure(DESIGNER_MENU_LIST, DESIGNER_ROUTE_STRUCTURES),
          ...mergeExternalMenuWithStructure(EXTERNAL_MENU_LIST, EXTERNAL_ROUTE_STRUCTURES),
          ...mergeFeatMenuWithStructure(FEAT_MENU_LIST, FEAT_ROUTE_STRUCTURES),
        ],
      }, {
        message: '获取菜单成功',
      });
    },
  },
]
