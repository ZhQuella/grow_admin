import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  mergeExternalMenuWithStructure,
  EXTERNAL_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-external/route-config';
import {
  mergeMenuWithStructure,
  WORKSPACE_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-workspace/route-config';
import { resultSuccess } from '@grow-admin-rock/mock/util';
import { MENU_LIST } from './menuList';
import { EXTERNAL_MENU_LIST } from './externalMenuList';

export default [
  {
    url: mockUrl('/menu/list'),
    method: "get",
    response: () => {
      return resultSuccess({
        menuList: [
          ...mergeMenuWithStructure(MENU_LIST, WORKSPACE_ROUTE_STRUCTURES),
          ...mergeExternalMenuWithStructure(EXTERNAL_MENU_LIST, EXTERNAL_ROUTE_STRUCTURES),
        ],
      }, {
        message: '获取菜单成功',
      });
    },
  },
]
