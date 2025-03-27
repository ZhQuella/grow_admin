<script setup lang="ts">
defineOptions({ name: "AutoLocker" });
import { ElMessage } from "element-plus";
import type { Ref } from "vue";
import { onMounted, onUnmounted, ref } from "vue";
import { eventManager } from "util/helper";
import { useLockScreen } from "store/modules/LockScreen";
import settingConfig from "@/setting";
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const { lockScreenTime, warningTimte } = settingConfig;
const countdown = ref((lockScreenTime - warningTimte) / 1000);

const idleAnimationFrame: Ref<number> = ref(0);
const lockScreenStore = useLockScreen();
const warningShown = ref(false);
const lastEventTime = ref(Date.now());

const showWarning = () => {
  const time = warningTimte / 1000;
  ElMessage({
    showClose: true,
    message: `${i18n.t('APP_OTHER.LOCKER_SCREEN_BEFORE')} ${time} ${i18n.t("APP_OTHER.LOCKER_SCREEN_AFTER")}`,
    type: 'warning',
    duration: warningTimte
  });
  warningShown.value = true;
};

const checkIdleTime = () => {
  const currentTime = Date.now();
  const elapsed = currentTime - lastEventTime.value;
  countdown.value = Math.max(0, (lockScreenTime - elapsed) / 1000);
  if (elapsed >= lockScreenTime) {
    lockScreenStore.setIsLockScreen(true);
    eventManager.removeAll(document.documentElement || document.body);
    cancelAnimationFrame(idleAnimationFrame.value);
    return;
  }
  if ((elapsed >= lockScreenTime - warningTimte) && !warningShown.value) {
    showWarning();
  }
  idleAnimationFrame.value = requestAnimationFrame(checkIdleTime);
};

const eventHandler = (event?: Event) => {
  lastEventTime.value = Date.now();
  warningShown.value = false;
  cancelAnimationFrame(idleAnimationFrame.value);
  countdown.value = (lockScreenTime - warningTimte) / 1000;
  idleAnimationFrame.value = requestAnimationFrame(checkIdleTime);
};

const initAutoLocker = () => {
  const eventList = ['click','keyup','keydown','mousemove','mousedown','mouseup','wheel'];
  eventManager.add(document.documentElement || document.body, eventList, eventHandler);
  lastEventTime.value = Date.now();
  warningShown.value = false;
  eventHandler();
  countdown.value = (lockScreenTime - warningTimte) / 1000;
};

const unsubscribe = lockScreenStore.$onAction(({ store, after }) => {
  after(() => {
    if(!store.getLocale){
      initAutoLocker()
    }
  })
})

onMounted(() => {
  !lockScreenStore.getLocale && initAutoLocker()
});

onUnmounted(() => {
  eventManager.removeAll(document.documentElement || document.body);
  cancelAnimationFrame(idleAnimationFrame.value);
  unsubscribe();
});
</script>