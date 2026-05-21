import { ThemeEnum } from '@grow-admin-rock/constants';
import { BeforeMiniState } from '#/menu';
import {
  HeaderSetting,
  MenuSetting,
  MultiTabsSetting,
  ProjectSetting,
  TransitionSetting,
} from '#/setting';
import { Store } from 'pinia';

export namespace Setting {
  export interface SettingState {
    darkMode?: ThemeEnum;
    // Page loading status
    pageLoading: boolean;
    // project config
    projectConfig: ProjectSetting | null;
    // When the window shrinks, remember some states, and restore these states when the window is restored
    beforeMiniInfo: BeforeMiniState;
  }

  export type SettingGetter = {
    getDarkMode: ThemeEnum;
    getBeforeMiniInfo: BeforeMiniState;
    getProjectConfig: ProjectSetting;
    getHeaderSetting: HeaderSetting;
    getMenuSetting: MenuSetting;
    getMultiTabsSetting: MultiTabsSetting;
    getPageLoading: boolean;
    getTransitionSetting: TransitionSetting;
  };

  export interface SettingAction {
    setBeforeMiniInfo(state: BeforeMiniState): void;
    setProjectConfig(config: DeepPartial<ProjectSetting>): void;
    setDarkMode(mode: ThemeEnum): void;
    setPageLoadingAction(loading: boolean): Promise<void>;
    resetProjectConfig(): void;
  }

  export type SettingStore = Store<
    string,
    SettingState,
    SettingGetter,
    SettingAction
  >;
}
