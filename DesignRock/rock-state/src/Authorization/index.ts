import { Menu } from '@grow-admin-rock/types';
import { Store } from 'pinia';

export namespace Auth {
  export interface AuthState {
    // Permission code list
    permCodeList: string[] | number[];
    // Whether the route has been dynamically added
    isDynamicAddedRoute: boolean;
    // To trigger a menu update
    lastBuildMenuTime: number;
    // Backstage menu list
    backMenuList: Menu[];
    frontMenuList: Menu[];
  }

  export type AuthGetters  = {
    getPermCodeList: string[] | number[];
    getBackMenuList: Menu[];
    getFrontMenuList: Menu[];
    getLastBuildMenuTime: number;
    getIsDynamicAddedRoute: boolean;
    getMenuList: Menu[];
  }

  export interface AuthActions {
    setPermCodeList(codeList: string[]): void;
    setBackMenuList(list: Menu[]): void;
    setFrontMenuList(list: Menu[]): void;
    setLastBuildMenuTime(): void;
    setDynamicAddedRoute(added: boolean): void;
    resetState(): void;
    changePermissionCode(): Promise<void>;
    buildRoutesAction(): Promise<RouteRecordItem[]>;
  }

  export type AuthStore = Store<string, AuthState, AuthGetters, AuthActions>; 
}
