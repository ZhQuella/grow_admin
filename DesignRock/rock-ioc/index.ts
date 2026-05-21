import 'reflect-metadata';
import { IocContainer } from './src';
export * from './src';
import Plugin from './src/plugin'

export const IocPlugin = Plugin;

declare module 'vue' {
  interface ComponentCustomProperties {
    $iocContainer: IocContainer;
  }
}
