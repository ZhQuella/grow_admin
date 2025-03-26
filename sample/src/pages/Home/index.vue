<template>
  <div
    class="h-[100vh] transition-all duration-500"
    :style="{
      filter: isLock ? `blur(10px)` : ''
    }"
  >
    <div
      v-loading="systemLoading"
      class="h-full bg-BG_COLOR overflow-hidden"
      :element-loading-text="t('PUBLIC.SYSTEM_LOADING')"
    >
      <Layout>
        <template #logo>
          <router-link :to="homePath" class="block h-full px-[20px] pt-[5px]">
            <Logo :show-title="!collapsed" />
          </router-link>
        </template>
        <template #menu>
          <Menu />
        </template>
        <template #tab>
          <Tabs />
        </template>
        <template #view>
          <RenderView />
        </template>
        <template #option>
          <Options />
        </template>
        <template #bread>
          <div class="py-[18px] px-[10px]">
            <NavigationPath />
          </div>
        </template>
      </Layout>
    </div>

    <el-drawer
      v-model="settingActive"
      size="400px"
      placement="right"
      :title="t('APP_OPTION.SETTING_TITLE')"
    >
      <SettingContent />
    </el-drawer>

    <el-dialog
      v-model="searchActive"
      destroy-on-close
      :title="t('APP_SEARCH.SEARCH_MENU')"
      width="650px"
    >
      <div class="p-[20px]">
        <AppSearch @select="onAppSearchSelect" />
      </div>
    </el-dialog>

    <teleport to="body">
      <transition
        appear
        name="animate__animated animate__bounce"
        enter-active-class="animate__fadeInDownBig"
        leave-active-class="animate__fadeOutUpBig"
      >
        <LockScreen v-if="isLock" />
      </transition>
    </teleport>
    <AutoLocker v-if="settingConfig.isAutoLocker"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import settingConfig from "@/setting";
import Layout from "components/public/Layout/index.vue";
import Logo from "components/base/GLogo/index.vue";
import RenderView from "components/public/RenderView/index.vue";
import Menu from "components/base/Menu/index.vue";
import Tabs from "components/base/Tabs/index.vue";
import Options from "components/business/Home/Options/index.vue";
import SettingContent from "components/business/Home/SettingContent/index.vue";
import NavigationPath from "components/base/NavigationPath/index.vue";
import AppSearch from "components/base/AppSearch/index.vue";
import LockScreen from "components/business/Home/LockScreen/index.vue";
import AutoLocker from "components/business/Home/AutoLocker/index.vue";

import { useMenuStore } from "store/modules/menu";
import { useLockScreen } from "store/modules/LockScreen";

import { useVariable } from "./use/useVariable";
import { useInteRouter } from "./use/useInteRouter";
import { useOption } from "./use/useOption";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const homePath = ref("");

const menuStore = useMenuStore();
const lockScreenStore = useLockScreen();
const collapsed = computed(() => {
  return menuStore.getCollapsed;
});

const { systemLoading } = useVariable();
const { settingActive, searchActive, onAppSearchSelect } = useOption();

const onCreated = async () => {
  const { defaultPath } = await useInteRouter({ systemLoading });
  homePath.value = defaultPath.value;
};

const isLock = computed(() => {
  return lockScreenStore.getLocale;
});

onCreated();
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "IndexPage"
});
</script>
