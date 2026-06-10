import type { App } from 'vue';
import { inject } from 'vue';
import { diKT } from '@grow-admin-rock/ioc';
import { forIn, isEmpty, isUndefined } from 'lodash-es';
import { Lib } from '../library';
import { RockComponent } from './RockComponent';
import ComponentMap from './ComponentMap';
import scanWmqComponens from './ScanWmqComponens';

export { RockComponent } from './RockComponent';

const MODULE_NAME = 'Grow';
export const COMPONENT_PREFIX = MODULE_NAME;

export const useComponentMap = (forceFromIoc = false): ComponentMap => {
  if (!forceFromIoc) {
    const componentMap = inject(Lib.types.ComponentMap, null);
    if (componentMap != null) {
      return componentMap;
    }
  }
  return diKT(Lib.types.ComponentMap);
};

const autoExportComponent: Record<string, WmqComponent<any>> = {};
const allWmqComponent: Record<string, WmqComponent<any>> = {};

type ReturnType<T extends boolean> = T extends true
  ? WmqComponent<any>
  : WmqComponent<any> | undefined;

export const useDriverComponent = <T extends WmqComponent<any>>(
  component: RockComponent | string,
): T | undefined => {
  let realComponent = useComponentMap().get(component);
  if (!realComponent) {
    realComponent = useComponentMap(true).get(component);
  }
  if (realComponent) {
    return realComponent as T;
  }
  console.warn(`组件${component}缺少驱动，请检查是否已经安装驱动`);
};

export const useComponent = <T extends boolean>(
  component: RockComponent | string,
  throwWhenUndefined: T = false as T,
): ReturnType<T> => {
  let realComponent = useComponentMap().get(component);
  if (!realComponent) {
    realComponent = useComponentMap(true).get(component);
  }
  if (isEmpty(autoExportComponent) || isEmpty(allWmqComponent)) {
    scanWmqComponens(autoExportComponent, allWmqComponent);
  }
  const wmqComponent = allWmqComponent[component];
  if (wmqComponent) {
    return wmqComponent as ReturnType<T>;
  }
  if (realComponent) {
    return realComponent as ReturnType<T>;
  }
  if (throwWhenUndefined) {
    throw new Error(`组件${component}未注册`);
  }
  return false as unknown as ReturnType<T>;
};

export const registerWmqComponent = (Vue: App, componentDict: WmqComponentDictionary) => {
  console.debug('RockComponent install components into ComponentMap in IOC...');
  const componentMap = useComponentMap(true);
  scanWmqComponens(autoExportComponent, allWmqComponent);

  const missingDrivers: string[] = [];

  forIn(RockComponent, (rockComponent: RockComponent) => {
    let finalRegisterComponent: WmqComponent<any> | undefined;
    const _comp = componentDict[rockComponent];
    const wmqComp = allWmqComponent[rockComponent];

    if (wmqComp) {
      const { customOptions: { isPresetComponent = false } = {} } = wmqComp;
      if (isPresetComponent) {
        if (_comp === null) {
          finalRegisterComponent = wmqComp;
        } else if (!isUndefined(_comp)) {
          finalRegisterComponent = _comp;
        }
      } else if (_comp) {
        finalRegisterComponent = _comp;
      } else {
        missingDrivers.push(rockComponent);
      }
      if (finalRegisterComponent) {
        componentMap.register(rockComponent, finalRegisterComponent);
      }
      Vue.component(`${COMPONENT_PREFIX}${rockComponent}`, wmqComp);
    } else if (_comp) {
      componentMap.register(rockComponent, _comp);
    }
  });

  if (missingDrivers.length > 0) {
    console.warn(
      `[Grow] ${missingDrivers.length} 个契约组件缺少驱动实现：${missingDrivers.join(', ')}`,
    );
  }
};

let registerNotice = () => {};
let registerMsg = () => {};
let registerDialog = () => {};

export const setNotice = (func = () => {}) => {
  registerNotice = func;
};
export const useNotice = () => registerNotice();

export const setMessage = (func = () => {}) => {
  registerMsg = func;
};
export const useMsg = () => registerMsg();

export const setDialog = (func = () => {}) => {
  registerDialog = func;
};
export const useDialog = () => registerDialog();
