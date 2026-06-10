import {
  defineComponent,
  computed,
  provide,
  h,
  unref,
  type InjectionKey,
  type ComputedRef,
  type PropType,
  type Component,
} from 'vue';
import { diKT } from '@grow-admin-rock/ioc';
import { RockComponent, Beans, ComponentMap } from '@grow-admin-rock/components';
import type { GrowAdminComponentDriver } from './bridge';
import { createDriverHook } from './ComponentDriverComposeable';

export const props = {
  abstract: Boolean,
  tag: { type: String, default: 'div' },
  driverCls: String,
  driver: {
    type: Object as PropType<GrowAdminComponentDriver>,
    required: false,
    default: null,
  },
};

function useComponentMap() {
  return diKT(Beans.ComponentMap);
}

export type DriverHook = {
  use: (key: string | RockComponent) => Component;
  useComponents: () => ComputedRef<Record<string, Component>>;
  useComponent: (key: string | RockComponent) => Component;
  useRegisteredComponents: () => ComponentMap;
  useRegisteredComponent: (key: string | RockComponent) => Component;
};

export const DriverHookKey: InjectionKey<DriverHook> = Symbol.for('driverHook');

export default defineComponent({
  name: 'ComponentDriverProvider',
  alias: ['ComponentDriver'],
  inheritAttrs: false,
  props,
  setup(props, { slots, expose }) {
    if (!slots.default) {
      console.debug('ComponentDriverProvider 缺少默认插槽，不会 render 任何内容！');
    }
    const driver = unref(props.driver);
    const wmqComponents = computed(() => useComponentMap());
    const { driverHook, driverComponentMap } = createDriverHook(driver, wmqComponents.value);
    provide(DriverHookKey, driverHook);
    if (driverComponentMap !== null) {
      provide(Beans.ComponentMap, driverComponentMap);
    }
    expose({ driverHook });
  },
  render() {
    return !this.abstract
      ? h(this.tag, { class: `grow-${this.driverCls}` }, this.$slots.default?.())
      : this.$slots.default?.();
  },
});
