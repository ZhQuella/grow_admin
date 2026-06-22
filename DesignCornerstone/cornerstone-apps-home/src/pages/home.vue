<template>
  <div class="h-[100vh] transition-all duration-500">
    <div class="h-full bg-[var(--layout-container-background-color)] overflow-hidden">
      <Layout>
        <template #logo>
          <LayoutLogo />
        </template>

        <template #menu>
          <Menu :key="layoutType" />
        </template>

        <template #bread>
          <Breadcrumb />
        </template>

        <template #option>
          <GrowButton
            v-if="showHeaderSettingButton"
            circle
            text
            :aria-label="t('layout.setting.title')"
            :title="t('layout.setting.title')"
            @click="openSetting"
          >
            <GrowIconify icon="ant-design:setting-outlined" :size="18" hover-pointer />
          </GrowButton>
          <LayoutUserInfo :user-info="userInfo" @logout="handleLogout" />
        </template>

        <template #tab>
          <Tabs />
        </template>

        <template #view>
          <ContentView />
        </template>
      </Layout>
      <SettingDrawer v-if="showSettingDrawer" v-model="settingActive" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Layout, LayoutLogo, SettingDrawer, Menu, Breadcrumb, ContentView, Tabs, LayoutUserInfo } from '@grow-admin-rock/layouts'
import { SettingButtonPositionEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig, useAppStore, useUserStore, useLayout } from '@grow-admin-rock/state'
import { useAppBootstrap } from './use/useAppBootstrap'
import { useHomeLayout } from './use/useHomeLayout'
import { useUserLogout } from './use/useUserLogout'

useAppBootstrap()
useHomeLayout()

const { t } = useI18n()
const appConfig = useAppConfig()
const appStore = useAppStore()
const userStore = useUserStore()
const { layoutType } = useLayout()
const { showSettingButton, showSettingDrawer, settingButtonPosition } = storeToRefs(appConfig)
const { settingActive } = storeToRefs(appStore)
const { userInfo } = storeToRefs(userStore)
const { handleLogout } = useUserLogout()

const showHeaderSettingButton = computed(() => {
  if (!showSettingButton.value || !showSettingDrawer.value) return false
  const position = settingButtonPosition.value
  return (
    position === SettingButtonPositionEnum.HEADER ||
    position === SettingButtonPositionEnum.AUTO
  )
})

function openSetting() {
  appStore.setSettingActive(true)
}
</script>
