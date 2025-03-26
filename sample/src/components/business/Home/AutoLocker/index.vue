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

const idleTimeout:Ref<any> = ref(null);
const warningTimeout:Ref<any> = ref(null);
const lockScreenStore = useLockScreen();

const showWarnig = () => {
  const time = warningTimte / 1000;
  ElMessage({
    showClose: true,
    message: `${i18n.t('APP_OTHER.LOCKER_SCREEN_BEFORE')} ${time} ${i18n.t("APP_OTHER.LOCKER_SCREEN_AFTER")}`,
    type: 'warning',
    duration: warningTimte
  });
}

const eventHandler = (event?: Event) => {
  clearTimeout(idleTimeout.value);
  clearTimeout(warningTimeout.value);
  countdown.value = (lockScreenTime - warningTimte) / 1000;
  idleTimeout.value = setTimeout(async () => {
    lockScreenStore.setIsLockScreen(true);
    eventManager.removeAll(document.documentElement || document.body);
  }, lockScreenTime);
  warningTimeout.value = setTimeout(showWarnig,lockScreenTime - warningTimte)
};

const initAutoLocker = () => {
  const eventList = ['click','keyup','keydown','mousemove','mousedown','mouseup','wheel'];
  eventManager.add(document.documentElement || document.body, eventList, eventHandler);
  eventHandler();
  countdown.value = (lockScreenTime - warningTimte) / 1000;
};

const unsubscribe = lockScreenStore.$onAction(({ store, after }) => {
  after(() => {
    !store.getLocale && initAutoLocker()
  })
})

onMounted(() => {
  !lockScreenStore.getLocale && initAutoLocker()
});

onUnmounted(() => {
  eventManager.removeAll(document.documentElement || document.body);
  clearTimeout(idleTimeout.value);
  clearTimeout(warningTimeout.value);
  unsubscribe();
});
</script>

<style scoped>

</style>