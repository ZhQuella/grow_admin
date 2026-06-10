import type { DataDictionary } from '@grow-admin-rock/types';
import forIn from 'lodash-es/forIn';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import { RockComponent } from './RockComponent';

const validRockComponents = new Set<string>(Object.values(RockComponent));

const scanGrowComponens = (
  presetComponents: DataDictionary<GrowComponent<any>> = {},
  growComponent: DataDictionary<GrowComponent<any>> = {},
): DataDictionary<GrowComponent<any>>[] => {
  const pkgs: Record<string, { default?: GrowComponent<any>; [key: string]: unknown }> =
    import.meta.glob(['./**/index.ts', '!./index.ts'], { eager: true });

  forIn(pkgs, (pkg) => {
    if (!isEmpty(pkg)) {
      forIn(pkg, (component) => {
        if (typeof component !== 'object' || component === null) return;
        const comp = component as GrowComponent<any>;
        const name = (comp as { name?: string }).name || get(comp, 'name');
        if (!name || !validRockComponents.has(name)) return;
        if (get(component, 'isPresetComponent', false)) {
          presetComponents[name] = comp;
        }
        growComponent[name] = comp;
      });
    }
  });
  return [presetComponents, growComponent];
};

export default scanGrowComponens;
