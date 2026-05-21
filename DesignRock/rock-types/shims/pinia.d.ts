// @ts-ignore
// eslint-disable-next-line
import type { PiniaPluginContext } from 'pinia';
import type { PersistStrategy, PersistOptions } from '#/store';
declare module 'pinia' {
  export interface DefineStoreOptions<
    // eslint-disable-next-line
    Id,
    // eslint-disable-next-line
    S,
    // eslint-disable-next-line
    G,
    // eslint-disable-next-line
    A
  > {
    /**
     * Persist store in storage.
     */
    persist?: PersistOptions;
  }
}
