export interface MenuStoreState {
  collapsed: boolean
  showMenu: boolean
}

export interface AppUiState {
  webFullScreen: boolean
  settingActive: boolean
  searchActive: boolean
  isPutAway: boolean
  pageLoading: boolean
  /** i18n key，由展示层调用 t() 翻译 */
  pageLoadingTip: string
}
