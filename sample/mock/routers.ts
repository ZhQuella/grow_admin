import { mockUrl } from '@grow-admin-rock/mock/constants';
import { resultSuccess } from '@grow-admin-rock/mock/util';
import { buildBackMenuList } from './buildMenuList';

export default [
  {
    url: mockUrl('/menu/list'),
    method: "get",
    response: () => {
      return resultSuccess({
        menuList: buildBackMenuList(),
      }, {
        message: '获取菜单成功',
      });
    },
  },
]
