import '@grow-admin-rock/styles'
import { createApp } from 'vue';
import App from './App.vue';
import { initIoc } from './plugin/initIoc';
import { removeAppLoading } from './removeAppLoading';


;(async () => {
  const app = createApp(App);
  await initIoc(app);
  app.mount('#app');
  requestAnimationFrame(() => {
    requestAnimationFrame(removeAppLoading);
  });
})();
