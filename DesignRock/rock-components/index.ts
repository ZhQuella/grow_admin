export * from './src/RockComponent';
export {
  setNotice,
  setMessage,
  setDialog,
  useNotice,
  useMsg,
  useDialog,
} from './src';
export { default as ComponentMap } from '#/ComponentMap';
export { withInstall, type WithInstall, type CustomComponent } from './src/utils/installSupport';
export { useComponent, useDriverComponent } from './src';
export { driverRef } from '#/utils/refSupport';
export { Lib } from './library';
export { default as Beans, AppContextParamDef as ContextParamDef } from './beankeys';
