import '@grow-admin-rock/styles'
import { createApp } from 'vue';
import App from './App.vue';
import { initIoc } from './plugin/initIoc';
import { appContext } from './plugin/initAppContext';

import {
  InfrastructureOptions,
  Lib as infrastructureLib,
} from '@grow-admin-rock/infrastructure'


;(async () => {
  const app = createApp(App);
  await initIoc(app);



  await appContext.load(app);


  app.mount('#app');
})();
