import { Autowired, Bean } from '@grow-admin-rock/ioc';
import TYPES from '#/../beankeys';
import type { Setting } from '@grow-admin-rock/types';
import { ComputedRef, computed } from 'vue';
/**
 * 多页签行为设置
 */
@Bean()
export class MultipleTabSetting {
  /**
   * 是否展示多标签
   */
  getShowMultipleTab: ComputedRef<boolean>;
  getShowQuick: ComputedRef<boolean>;
  getShowRedo: ComputedRef<boolean>;
  getShowFold: ComputedRef<boolean>;
  constructor(
    @Autowired(TYPES.SettingStore) settingStore: Setting.SettingStore
  ) {
    const multiTabsSettingStore = settingStore.getMultiTabsSetting || {};
    this.getShowMultipleTab = computed(() => multiTabsSettingStore.show);
    this.getShowQuick = computed(() => multiTabsSettingStore.showQuick);
    this.getShowRedo = computed(() => multiTabsSettingStore.showRedo);
    this.getShowFold = computed(() => multiTabsSettingStore.showFold);
  }
  
}
