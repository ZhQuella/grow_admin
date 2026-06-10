import {
  type ComponentDriverBuilder,
  GrowAdminComponentDriver,
  ComponentInstaller,
  toBuilder,
} from '@grow-admin-rock/component-driver';
import type { App } from 'vue';
import type { RockComponent } from '@grow-admin-rock/components';
import type { ComponentEntry } from '@grow-admin-rock/component-driver';
import { install } from './installer';

export class EPComponentDriver extends GrowAdminComponentDriver {
  constructor(app?: App) {
    super(app);
  }

  installNew(component: RockComponent, app?: App): ComponentEntry | undefined {
    return install(component, app);
  }

  static builder(app?: App): ComponentDriverBuilder {
    const bridgeBuilder = {} as ComponentDriverBuilder;
    const bridge = new EPComponentDriver(app);
    const installer = new ComponentInstaller(install, bridgeBuilder, app);
    return toBuilder(installer, bridgeBuilder, bridge);
  }
}
