import type { DataDictionary } from '@grow-admin-rock/types';
import forIn from 'lodash-es/forIn';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import { RockComponent } from './RockComponent';

const validRockComponents = new Set<string>(Object.values(RockComponent));

const scanWmqComponens = (
  presetComponents: DataDictionary<WmqComponent<any>> = {},
  wmqComponent: DataDictionary<WmqComponent<any>> = {},
): DataDictionary<WmqComponent<any>>[] => {
  const pkgs: Record<string, { default?: WmqComponent<any>; [key: string]: unknown }> =
    import.meta.glob(['./**/index.ts', '!./index.ts'], { eager: true });

  forIn(pkgs, (pkg) => {
    if (!isEmpty(pkg)) {
      forIn(pkg, (component) => {
        if (typeof component !== 'object' || component === null) return;
        const comp = component as WmqComponent<any>;
        const name = (comp as { name?: string }).name || get(comp, 'name');
        if (!name || !validRockComponents.has(name)) return;
        if (get(component, 'isPresetComponent', false)) {
          presetComponents[name] = comp;
        }
        wmqComponent[name] = comp;
      });
    }
  });
  return [presetComponents, wmqComponent];
};

export default scanWmqComponens;
