import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { di } from '@grow-admin-rock/ioc';
import {Lib} from '#/../library';

export let i18n: ReturnType<typeof createI18n>;

// setup i18n instance with glob
export const setupI18n = async (app: App) => {
  app.use(await di(Lib.types.I18n));
};
