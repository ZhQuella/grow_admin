/**
 * 组件库类型
 */
export enum ComponentLibraryType {
  ElementPlus = 'element-plus',
  NaiveUI = 'naive-ui',
  AntDesignVue = 'ant-design-vue',
}

export type ComponentLibrarySetting = {
  /** 全局默认组件库 */
  componentLibrary: ComponentLibraryType;
};
