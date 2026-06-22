const HOME_ROUTE: RouteRecordItem = {
  path: '/home',
  name: 'Home',
  component: () => import('../pages/home.vue'),
  meta: {
    title: '首页',
    isBasic: true,
  },
};

export const RouteList: RouteRecordItem[] = [HOME_ROUTE];

export { createAuthGuard } from './guard';
