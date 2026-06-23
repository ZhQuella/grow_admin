import 'vue-router'
import type { PageOpenModeEnum } from '@grow-admin-rock/constants'
declare module 'vue-router' {
  interface RouteMeta extends Record<string | number | symbol, any> {
    [key: string]: any;
    title: string;
    // icon
    icon?: string;
    // Whether to ignore permissions
    ignoreAuth?: boolean;
    // role info
    allowRoles?: string[];
    // is it fixed on tab
    affix?: boolean;
    // Whether to show in view area by default
    defaultShow?: boolean;
    // Whether the route has been dynamically added
    hideBreadcrumb?: boolean;
    // Whether to show in menu
    isVisible?: boolean;
    //隐藏子菜单
    hideChildrenInMenu?: boolean;
    //菜单排序
    orderNo?: number;
    //是否是基础路由
    isBasic?: boolean;
    // 微前端配置
    microConfig?: {
      entry?: string;
      appName?: string;
    }
    // keep-alive 缓存标识，与路由 name 解耦时可动态生成
    componentName?: string;
    // 是否缓存页面
    isKeepAlive?: boolean;
    // 是否外部页面
    isExternalPage?: boolean;
    // 页面打开方式
    openMode?: PageOpenModeEnum;
    // 外部页面链接
    link?: string;
  }
}
