import type { Setting } from "@grow-admin-rock/types";
import { Autowired, Bean } from "@grow-admin-rock/ioc";
import TYPES from '#/../beankeys';
import { Ref, computed } from "vue";
import { RouterTransitionEnum } from "@grow-admin-rock/constants";

@Bean()
export class TransitionSetting {
  settingStore: Setting.SettingStore;
  getEnableTransition:Ref<boolean>;
  getOpenNProgress:Ref<boolean>;
  getOpenPageLoading:Ref<boolean>;
  getBasicTransition:Ref<RouterTransitionEnum>;
  constructor(
    @Autowired(TYPES.SettingStore) settingStore: Setting.SettingStore,
  ) {
    this.settingStore = settingStore;
    const getEnableTransition = computed(() => settingStore.getTransitionSetting?.enable);
    const getOpenNProgress = computed(() => settingStore.getTransitionSetting?.openNProgress);
    const getOpenPageLoading = computed((): boolean => !!settingStore.getTransitionSetting?.openPageLoading);
    const getBasicTransition = computed(() => settingStore.getTransitionSetting?.basicTransition);
    this.getBasicTransition = getBasicTransition;
    this.getEnableTransition = getEnableTransition;
    this.getOpenNProgress = getOpenNProgress;
    this.getOpenPageLoading = getOpenPageLoading;
  }
  /**
   * 更行过渡效果设置
   * @param transitionSetting 
   */
  setTransitionSetting(transitionSetting: Partial<TransitionSetting>) {
    this.settingStore.setProjectConfig({ transitionSetting });
  }
}