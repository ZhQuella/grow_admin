import { t } from '@grow-admin-rock/locale';

const LOGIN_ROUTE: RouteRecordItem = {
  path: '/',
  name: 'Login',
  component: () => import('../pages/Login/index.vue'),
  meta: {
    title: t('routes.basic.login'),
    whiteRoute: true,
    isBasic: true
  },
};


export const RouteList: RouteRecordItem[] = [LOGIN_ROUTE];

export { createAuthGuard } from './guard';
