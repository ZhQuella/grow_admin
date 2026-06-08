import { Beans, type DataEventBus } from '@grow-admin-rock/state';

import { diKT } from '@grow-admin-rock/ioc'

export * from './use-breakpoint'
export * from './use-scroll-to'
export * from './use-event-listener'
/**
 * 获取时间总线
 * 
 * @returns 
 */
export const useEventbus = ():DataEventBus => {
  return diKT(Beans.DataEventBus)
}