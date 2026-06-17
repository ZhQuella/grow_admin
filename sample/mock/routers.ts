import {
  mergeMenuWithStructure,
  WORKSPACE_ROUTE_STRUCTURES,
} from '@grow-admin-cornerstone/apps-workspace/route-config';
import { resultSuccess } from '@grow-admin-rock/mock/util';
import { MENU_LIST } from './menuList';

export default [
  {
    url: "/api/menu/list",
    method: "get",
    response: () => {
      return resultSuccess({
        menuList: mergeMenuWithStructure(MENU_LIST, WORKSPACE_ROUTE_STRUCTURES),
      }, {
        message: '获取菜单成功',
      });
    },
  },
]
