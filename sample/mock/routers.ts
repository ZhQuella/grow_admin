import { WORKSPACE_ROUTE_CONFIGS } from '@grow-admin-cornerstone/apps-workspace/route-config';
import { resultSuccess } from '@grow-admin-rock/mock/util';

export default [
  {
    url: "/api/menu/list",
    method: "get",
    response: () => {
      return resultSuccess({
        menuList: WORKSPACE_ROUTE_CONFIGS,
      }, {
        message: '获取菜单成功',
      });
    },
  },
]
