import type { RouteRecordItem } from '@grow-admin-rock/types'
import BasicLayout from '@/layouts/BasicLayout.vue'

export const RouteList: RouteRecordItem[] = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页',
        },
      },
    ],
  },
]
