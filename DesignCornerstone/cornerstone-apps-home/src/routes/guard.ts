import { AUTHORITY_TOKEN } from '@grow-admin-rock/constants';
import { Lib as routeLib } from '@grow-admin-rock/middleware-router';
import { diKT } from '@grow-admin-rock/ioc';

function getToken() {
  return sessionStorage.getItem(AUTHORITY_TOKEN);
}

function routeTable() {
  return diKT(routeLib.types.RouteTable);
}

/**
 * 创建首页访问守卫：白名单路由放行，其余路由需登录
 */
export function createAuthGuard() {
  routeTable().router.beforeEach((to, _from, next) => {
    const token = getToken();

    if (to.meta?.whiteRoute) {
      if (token) {
        next({ name: 'Home' });
        return;
      }
      next();
      return;
    }

    if (!token) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    next();
  });
}
