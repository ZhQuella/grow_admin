import { Setting } from './store';
export class RootSetting {
  settingStore: Setting.SettingStore;
  constructor(settingStore: Setting.SettingStore) {
    this.settingStore = settingStore;
  }
}

