import * as pack from './package.json';
import type { CommonModuleLibContext } from '@grow-admin-rock/base-package';
import { install } from '@grow-admin-rock/base-package';
import { ServiceIdentifier, AsyncIocModule, di } from '@grow-admin-rock/ioc';
import { I18nOptions, createI18n } from 'vue-i18n';
import { createI18nOptions } from './src/options'
import { setupI18n } from '#/setup-i18n';

type I18n = ReturnType<typeof createI18n>;

const types = {
  I18nOptions: Symbol.for(`${pack.name}/I18nOptions`) as ServiceIdentifier<I18nOptions>,
  I18n: Symbol.for(`${pack.name}/I18n`) as ServiceIdentifier<I18n>,
};

export const Lib: CommonModuleLibContext<typeof types> = {
  install,
  name: pack.name,
  version: pack.version,
  types,
  module: new AsyncIocModule(async (bind, unbind, isBind) => {
    let options: I18nOptions | undefined;
    if (!isBind(types.I18nOptions)) {
      options = await createI18nOptions()
      bind(types.I18nOptions).toConstantValue(options);
    } else {
      options = await di(types.I18nOptions);
    }
    bind(types.I18n).toConstantValue(createI18n(options))
  }),
  async onSetup(app) {
    await setupI18n(app);
  },
};
