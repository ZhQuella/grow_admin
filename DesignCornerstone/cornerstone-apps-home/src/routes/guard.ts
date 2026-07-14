import { AUTHORITY_TOKEN } from '@grow-admin-rock/constants';
import { Lib as routeLib } from '@grow-admin-rock/middleware-router';
import { useAuthStore } from '@grow-admin-rock/state';
import { diKT } from '@grow-admin-rock/ioc';
import { registerDynamicRoutes } from './registerDynamicRoutes';

function getToken() {
  return sessionStorage.getItem(AUTHORITY_TOKEN);
}

function routeTable() {
  return diKT(routeLib.types.RouteTable);
}

/** 动态注册后目标地址是否仍有可用页面（非仅匹配到 Home 容器） */
function isNavigableDestination(fullPath: string): boolean {
  const { matched } = routeTable().router.resolve(fullPath);
  if (!matched.length) {
    return false;
  }
  const lastMatched = matched[matched.length - 1];
  const name = lastMatched?.name;
  return name != null && name !== 'Home' && name !== 'HomeIndexRedirect' && name !== 'Login';
}

/**
 * 创建首页访问守卫：白名单路由放行，其余路由需登录
 */
export function createAuthGuard() {
  routeTable().router.beforeEach(async (to, _from, next) => {
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

    const authStore = useAuthStore();
    if (!authStore.getIsDynamicAddedRoute) {
      const modeChanged = await registerDynamicRoutes();
      authStore.setDynamicAddedRoute(true);

      // 权限模式变更，或旧 URL 在新模式下已失效：回到 Home 走默认菜单，避免白屏
      if (modeChanged || !isNavigableDestination(to.fullPath)) {
        next({ name: 'Home', replace: true });
        return;
      }

      next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true });
      return;
    }

    next();
  });
}
