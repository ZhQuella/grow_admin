import type { Component, MaybeRef, Ref } from 'vue';
import { unref } from 'vue';

export const DriverRefKey = 'DriverRef';

export const driverRef = <T extends Component>(
  wmqComponentRef: MaybeRef<WmqComponent<T>>,
): Component | undefined => {
  const wmqComponent = unref(wmqComponentRef);
  if (!wmqComponent) {
    return undefined;
  }
  return unref(wmqComponent[DriverRefKey]);
};
