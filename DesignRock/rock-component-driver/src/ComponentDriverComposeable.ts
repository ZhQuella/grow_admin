import type { Component } from 'vue';
import { computed, unref } from 'vue';
import { ComponentMap } from '@grow-admin-rock/components';
import type { GrowAdminComponentDriver } from './bridge';
import type { DriverHook } from './ComponentDriverProvider';

const defaultEmptyMap = new ComponentMap();

export const createDriverHook = (
  driver: GrowAdminComponentDriver | null,
  defaultComponentMap = defaultEmptyMap,
) => {
  let driverComponentMap: ComponentMap | null = null;
  if (driver != null) {
    driverComponentMap = new ComponentMap();
    for (const [key, value] of driver.componentMap.entries()) {
      driverComponentMap.register(key, value);
    }
  }

  const componentsInDriver = computed(() => {
    const ret: Record<string, Component> = {};
    if (driver) {
      for (const [key, value] of driver.componentMap.entries()) {
        ret[key as string] = value;
      }
    }
    return ret;
  });

  const driverHook: DriverHook = {
    useComponents: () => componentsInDriver,
    useComponent: (key) => {
      if (componentsInDriver.value) {
        return unref(componentsInDriver.value[key] || defaultComponentMap?.get(key) || null);
      }
      return null;
    },
    useRegisteredComponents: () => defaultComponentMap,
    useRegisteredComponent: (key) => driverHook.useRegisteredComponents().get(key) || null,
    use: (key) => unref(driverHook.useComponent(key) || driverHook.useRegisteredComponent(key)),
  };

  return { driverHook, driverComponentMap };
};
