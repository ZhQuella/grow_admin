import { App } from "vue";
import { forEach, isEmpty, groupBy, keys } from 'lodash-es';
import { AsyncIocModule, ServiceIdentifier, contextContianer } from "@grow-admin-rock/ioc";

type PriorityObserver = { pri: number, obs: (app: App) => Promise<void> };

type IocLoadedObserver = {
  preObservers: PriorityObserver[];
  loadedObservers: PriorityObserver[];
};

const runObsOrdered = async (app: App, observers: PriorityObserver[]) => {
  const preObservers: { [key: number]: PriorityObserver[] } = groupBy(
    observers,
    (o: PriorityObserver) => o.pri
  );
  // @ts-ignore
  const sortedKeys: number[] = keys(preObservers).sort((a: number, b: number) => a - b);
  for (const key of sortedKeys) {
    await Promise.all(preObservers[key].map((o: PriorityObserver) => o.obs(app)))
  }
}


/**
 * A generic type for defining properties in the AppContext class.
 *
 * @template T The type of the property.
 */
export type AppContextPropertyGeneric<T> = Symbol;

export class AppContext {
  iocModules: AsyncIocModule[];
  basicRoutes: RouteRecordItem[];
  appRoutes: RouteRecordItem[];
  loadedObservers: IocLoadedObserver = {
    preObservers: [],
    loadedObservers: []
  };
  [key: string]: any;
  constructor() {
    this.basicRoutes = [];
    this.appRoutes = [];
    this.iocModules = [];
  }

  getParam<T, K extends AppContextPropertyGeneric<T>>(key: K): T {
    const keyStr = key.toString()
    const data = this[keyStr]
    if (data) {
      return data as T
    } else {
      throw new Error(`AppContext中缺少参数<${keyStr}>`)
    }
  }

  registerParam<T, K extends AppContextPropertyGeneric<T>>(key: K, data: T) {
    this[key.toString()] = data
  }

  /**
   * 注册路由
   * @param routes
   */
  registerRoutes(routes: RouteRecordItem[]) {
    forEach(routes, (route: RouteRecordItem) => {
      if (route.meta?.isBasic) {
        this.basicRoutes.push(route)
      } else {
        this.appRoutes.push(route)
      }
    })
  }

  /**
   * 监听IocModule加载前
   * @param on
   * @param priority 不传递默认优先级为9999
   */
  onBeforeIocLoaded(on: (app: App) => Promise<void>, priority?: number) {
    if (priority) {
      this.loadedObservers.preObservers.push({ pri: priority, obs: on });
    } else {
      this.loadedObservers.preObservers.push({ pri: 9999, obs: on });
    }
  }

  /**
   * 监听IocModule加载完成
   * @param on
   * @param priority 不传递默认优先级为9999，传递负数则为预加载，传递正数则为加载完成后执行
   */
  onIocLoaded(on: (app: App) => Promise<void>, priority?: number) {
    if (priority) {
      this.loadedObservers.loadedObservers.push({ pri: priority, obs: on });
    } else {
      this.loadedObservers.loadedObservers.push({ pri: 9999, obs: on });
    }
  }



  /**
   * 加载VueApp
   * @param app
   */
  async load(app: App, onLoadFinished?: () => Promise<void>) {
    if (!isEmpty(this.loadedObservers.preObservers)) {
      runObsOrdered(app, this.loadedObservers.preObservers)
    }
    await contextContianer().loadAsync(...this.iocModules)
    if (!isEmpty(this.loadedObservers.loadedObservers)) {
      runObsOrdered(app, this.loadedObservers.loadedObservers)
    }
    await onLoadFinished?.();
  }
}
