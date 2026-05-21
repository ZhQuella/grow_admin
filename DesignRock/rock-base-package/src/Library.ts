import { AsyncIocModule, ServiceIdentifier } from '@grow-admin-rock/ioc';
import type { App } from 'vue';
import { AppContext } from './AppContext';

export interface TypeKey {
  [key: string]: ServiceIdentifier<any>;
}

export interface Library<K extends TypeKey> {
  /**
   * 库名称
   */
  readonly name: string;
  /**
   * 库版本
   */
  readonly version: string;
  /**
   * 库的描述信息
   */
  readonly describtion?: string;
  /**
   * 全部声明的类型
   */
  types: K;
  /**
   * IOC模块
   */
  module: AsyncIocModule;
  /**
   * 路由表
   */
  routes: RouteRecordItem[];

  /**
   * module优先级
   */
  priority?: number;

  /**
   * 生命周期，应用启动后启动模块
   * @param app Vue app
   * @param appContext 
   * @returns 
   */
  onSetup?: (app: App, appContext: AppContext) => Promise<void>;

  /**
     * 生命周期，应用启动后启动模块
     * @param app Vue app
     * @param appContext 
     * @returns 
     */
  beforeSetup?: (app: App<any>, appContext: AppContext) => Promise<void>;

  /**
   * 插件入口
   * @param app
   * @param options
   * @returns
   */
  install: (app: App, options: AppContext) => any;
}

/**
 * 内部类型
 */
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ModuleLibContext<T extends keyof Library<K>, K extends TypeKey> = MakeOptional<
  Library<K>,
  T
>;
export type CommonModuleLibContext<K extends TypeKey> = ModuleLibContext<'routes', K>;
/**
 * 基础模块类型
 */
export type BasicModuleLibContext = ModuleLibContext<'routes' | 'types' | 'module', any>;
