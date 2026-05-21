import { ThemeEnum } from "@grow-admin-rock/constants"
import { BeforeMiniState } from "#/menu"
import { HeaderSetting, MenuSetting, MultiTabsSetting, ProjectConfig, TransitionSetting } from "#/setting"
import { Store } from "pinia"

/**
 * @deprecated use Setting namespace instead
 */
export namespace Config {
  export interface ConfigState {
    darkMode?: ThemeEnum
    // Page loading status
    pageLoading: boolean
    // project config
    projectConfig: ProjectConfig | null
    // When the window shrinks, remember some states, and restore these states when the window is restored
    beforeMiniInfo: BeforeMiniState
  }

  export type ConfigGetter  = {
    getDarkMode: ThemeEnum
    getBeforeMiniInfo: BeforeMiniState
    getProjectConfig: ProjectConfig
    getHeaderSetting: HeaderSetting
    getMenuSetting: MenuSetting
    getMultiTabsSetting: MultiTabsSetting
    getPageLoading: boolean
    getTransitionSetting: TransitionSetting
  }

  export interface ConfigAction {
    setBeforeMiniInfo(state: BeforeMiniState): void;
    setProjectConfig(config: DeepPartial<ProjectConfig>): void;
    setDarkMode(mode: ThemeEnum): void;
    setPageLoadingAction(loading: boolean): Promise<void>;
    resetProjectConfig():void;
  }

  export type ConfigStore = Store<string, ConfigState, ConfigGetter, ConfigAction>
}