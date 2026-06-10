import type { App, Component } from 'vue';
import { RockComponent } from '@grow-admin-rock/components';
import type { ComponentEntry, RockComponentDetailDict } from './installer';

export abstract class GrowAdminComponentDriver {
  app?: App;
  componentMap: Map<RockComponent, Component>;

  protected constructor(app?: App) {
    this.app = app;
    this.componentMap = new Map<RockComponent, Component>();
  }

  getApp(): App | undefined {
    return this.app;
  }

  getComponent(name: RockComponent): Component | undefined {
    return this.componentMap.get(name);
  }

  loadComponent(name: RockComponent): Component | undefined {
    const registeredComponent = this.componentMap.get(name);
    if (registeredComponent) {
      return registeredComponent;
    }
    const componentEntry = this.installNew(name, this.app);
    if (componentEntry) {
      this.registerComponent(componentEntry);
      return componentEntry.value;
    }
  }

  componentDictoray(): RockComponentDetailDict {
    const dict: RockComponentDetailDict = {};
    this.componentMap.forEach((value, key) => {
      dict[key] = value;
    });
    return dict;
  }

  registerComponent(entry: ComponentEntry): GrowAdminComponentDriver {
    this.componentMap.set(entry.key, entry.value);
    return this;
  }

  installNew(_component: RockComponent, _app?: App): ComponentEntry | undefined {
    return undefined;
  }
}

export class ComponentInstaller {
  constructor(
    installer: (rockComponent: RockComponent, app?: App) => ComponentEntry | undefined,
    builder: ComponentDriverBuilder,
    app?: App,
  ) {
    for (const name in RockComponent) {
      const componentEnum = RockComponent[name as keyof typeof RockComponent];
      this[`enable${componentEnum}`] = () => {
        const entry = installer(componentEnum, app);
        if (entry) {
          builder.componentBridge().registerComponent(entry);
        }
        return builder;
      };
    }
  }
  [key: string]: (app?: App) => ComponentDriverBuilder;
}

export interface BuilderTail {
  componentBridge(): GrowAdminComponentDriver;
  enableAll(): GrowAdminComponentDriver;
  finish(): GrowAdminComponentDriver;
}

export type ComponentDriverBuilder = ComponentInstaller & BuilderTail;

export const toBuilder = (
  installer: ComponentInstaller,
  driverBuilder: ComponentDriverBuilder,
  driver: GrowAdminComponentDriver,
) => {
  Object.assign(driverBuilder, installer);
  driverBuilder.componentBridge = () => driver;
  driverBuilder.enableAll = () => {
    for (const name in RockComponent) {
      installer[`enable${RockComponent[name as keyof typeof RockComponent]}`]();
    }
    return driverBuilder.finish();
  };
  driverBuilder.finish = () => driver;
  return driverBuilder;
};
