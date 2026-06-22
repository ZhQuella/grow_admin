import type { App, Component } from 'vue';
import type { DataDictionary } from '@grow-admin-rock/types';
import type { RockComponent } from '@grow-admin-rock/components';
import { withInstall } from '@grow-admin-rock/components';

export type ComponentEntry = { key: RockComponent; value: Component };
export type Installer = (app?: App) => ComponentEntry | undefined;

export type RockComponentDetailDict = DataDictionary<Component>;

export { withInstall };
