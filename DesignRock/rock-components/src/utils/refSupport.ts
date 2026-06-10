import type { Component, MaybeRef, Ref } from 'vue';
import { unref } from 'vue';

export const DriverRefKey = 'DriverRef';

export const driverRef = <T extends Component>(
  growComponentRef: MaybeRef<GrowComponent<T>>,
): Component | undefined => {
  const growComponent = unref(growComponentRef);
  if (!growComponent) {
    return undefined;
  }
  return unref(growComponent[DriverRefKey]);
};
