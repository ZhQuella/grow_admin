import * as pack from "./package.json"
import { toPackage } from '@grow-admin-rock/base-package';
import { diK } from "@grow-admin-rock/ioc";
import type { ModuleLibContext } from '@grow-admin-rock/base-package';
import { Beans as settingBeans } from '@grow-admin-rock/settings';
import { createBreakpointListen } from "#/event";

export const Lib: ModuleLibContext<'types' | 'routes' | 'module', any> = toPackage({
  name: pack.name,
  version: pack.version,
  onSetup: async (app, appContext) => {
    const appStatus = diK(settingBeans.AppStatus);
    if (appStatus) {
      createBreakpointListen(({ screenMap, sizeEnum, width }) => {
        const lgWidth = screenMap.get(sizeEnum.LG);
        if (lgWidth) {
          appStatus.setIsMobile(width.value - 1 < lgWidth);
        }
        appStatus.restoreState();
      })
    }
  }
});
