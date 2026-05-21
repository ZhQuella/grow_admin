import { Container } from 'inversify';
import { App, InjectionKey, getCurrentInstance, inject } from 'vue';
import type { interfaces } from 'inversify';
import {
  CONTAINER_KEY,
  IocContainer,
  IocContainerOptions,
  ServiceIdentifier,
} from './ioc';
import { makeLoggerMiddleware } from './logger';

export * from './ioc';

let container: IocContainer | undefined;

/**
 * 通过app对象设置IOC容器
 * @param app vue实例
 * @param options vue实例
 */
export const setupByApp = (app: App, options: IocContainerOptions) => {
  if (container || app.config.globalProperties.$iocContainer) {
    throw new Error('IOC容器已经初始化, 请勿重复初始化');
  }
  const _container = createIocContainer(options);
  console.debug('Grow Admin IOC Plugin create container');
  app.config.globalProperties.$iocContainer = _container;
  app.provide(CONTAINER_KEY as InjectionKey<IocContainer>, _container);
  container = _container;
};

/**
 * 生成唯一标志
 * @param target 唯一标志原始值
 * @returns
 */
export const keyOf = <T>(key: any): ServiceIdentifier<T> => {
  return Symbol.for(key.name) as ServiceIdentifier<T>;
};

/**
 * 从Vue的上下文中获取IOC容器
 * @returns
 */
export const contextContianer = (
  currentContainer?: IocContainer
): IocContainer => {
  if (currentContainer) {
    return currentContainer;
  }
  const instance = getCurrentInstance();
  if (instance) {
    // 在Vue的上下文中，可以通过inject获取容器
    const _container = inject(CONTAINER_KEY as InjectionKey<IocContainer>);
    if (_container) {
      return _container;
    }
  }
  if (!container) {
    throw new Error('IOC容器未初始化, 请确认插件已安装');
  }
  return container;
};

/**
 * 根据keyOf计算的BeanKey获取ioc容器中的实例，如果不存在则抛出异常
 * @param key beanKey, 会使用keyOf方法计算BeanKey
 * @param container
 * @returns
 */
export const resolveByTypeOrThrow = <T>(
  key: any,
  container?: IocContainer
): T => {
  try {
    return contextContianer(container).get(keyOf<T>(key));
  } catch (error) {
    console.debug('ResolveByType fail Throw:', key, error);
    throw error;
  }
};

/**
 * 根据keyOf计算的BeanKey获取ioc容器中的实例，如果不存在则返回undefined
 * @param key beanKey, 会使用keyOf方法计算BeanKey
 * @param container
 * @returns
 */
export const resolveByType = <T>(
  key: any,
  container?: IocContainer
): T | undefined => {
  try {
    return resolveByTypeOrThrow(key, container);
  } catch (error) {
    console.debug('ResolveByType fail', key, error);
    return undefined;
  }
};

/**
 * 异步获取ioc容器中的实例，如果不存在则抛出异常
 * @param key 
 * @param container 
 * @returns 
 */
export const di = async <T>(
  key: ServiceIdentifier<T>,
  container?: IocContainer
): Promise<T> => {
  try {
    return await contextContianer(container).getAsync(key);
  } catch (error) {
    console.debug('FetchByKey fail Throw:', key, error);
    throw error;
  }
};

export const fetchByKey = di

/**
 * 获取ioc容器中的实例，如果不存在则抛出异常
 * @param key 
 * @param container 
 * @returns 
 */
export const diKT = <T>(
  key: ServiceIdentifier<T>,
  container?: IocContainer
): T => {
  try {
    return contextContianer(container).get(key);
  } catch (error) {
    throw error;
  }
};
/**
 * @see diKT
 */
export const resolveByKeyOrThrow = diKT;

/**
 * 获取ioc容器中的实例，如果不存在则返回undefined
 * @param key beanKey
 * @returns
 */
export const diK = <T>(
  key: ServiceIdentifier<T>,
  container?: IocContainer
): T | undefined => {
  try {
    return diKT(key, container);
  } catch (ignore) {
    return undefined;
  }
}
/**
 * @see diK
 */
export const resolveByKey = diK

/**
 * 创建IOC容器
 * @param options
 * @returns
 */
export const createIocContainer = (
  options?: interfaces.ContainerOptions
): IocContainer => {
  const con = new Container(options || { defaultScope: 'Singleton' });
  if (import.meta.env.DEV) {
    // 开发模式下开启IOC的LOG插件
    con.applyMiddleware(makeLoggerMiddleware());
  }
  return con;
};
