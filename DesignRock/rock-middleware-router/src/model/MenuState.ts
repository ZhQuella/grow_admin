import { PermissionModeEnum } from '@grow-admin-rock/constants';
import type { DefineAppConfigOptions } from '@grow-admin-rock/types';
import { Autowired, Bean } from '@grow-admin-rock/ioc';
import { Lib } from '@grow-admin-rock/state';

@Bean()
export class MenuState {
  appConfig: DefineAppConfigOptions;
  constructor(@Autowired(Lib.types.DefineAppConfigOptions) appConfig: DefineAppConfigOptions) {
    this.appConfig = appConfig;
  }

  /**
   *
   *
   * @returns
   */
  theConfig(): DefineAppConfigOptions {
    return this.appConfig;
  }

  /**
   * 获取权限模式
   *
   * @returns
   */
  getPermissionMode(): PermissionModeEnum {
    return this.theConfig().permissionMode;
  }

  /**
   * 是否是后台权限模式
   * @returns
   */
  isBackMode = () => {
    return this.getPermissionMode() === PermissionModeEnum.BACK;
  };
  /**
   * 是否是路由表模式
   * @returns
   */
  isRouteMappingMode = () => {
    return this.getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
  };
  /**
   * 是否是角色路由模式
   * @returns
   */
  isRoleMode = () => {
    return this.getPermissionMode() === PermissionModeEnum.ROLE;
  };
}
