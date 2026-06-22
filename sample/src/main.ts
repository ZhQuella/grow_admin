import '@grow-admin-rock/styles'
import { createApp } from 'vue';
import App from './App.vue';
import { initIoc } from './plugin/initIoc';
import { removeAppLoading } from './removeAppLoading';
import { setupProdMockServer } from '../mock/_mock-server';

if (__VITE_USE_MOCK__ && import.meta.env.PROD) {
  setupProdMockServer();
}

;(async () => {
  const app = createApp(App);
  await initIoc(app);
  app.mount('#app');
  requestAnimationFrame(() => {
    requestAnimationFrame(removeAppLoading);
  });
})();
