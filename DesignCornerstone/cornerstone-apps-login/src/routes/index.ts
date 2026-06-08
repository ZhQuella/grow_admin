import { t } from '@weiming-rock/locale';

const LOGIN_ROUTE: RouteRecordItem = {
  path: '/login',
  name: 'Login',
  component: () => import('../pages/login.vue'),
  meta: {
    title: t('routes.basic.login'),
    whiteRoute: true,
    isBasic: true
  },
};

const LoginByOA: RouteRecordItem = {
  path: '/login-app-secret',
  name: 'LoginByOA',
  component: () => import('../pages/login-oa.vue'),
  meta: {
    title: t('routes.basic.login'),
    whiteRoute: true,
    isBasic: true
  },
}

export const RouteList: RouteRecordItem[] = [LOGIN_ROUTE, LoginByOA];

export { createAuthGuard } from './guard';
