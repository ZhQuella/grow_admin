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
          <LayoutHeaderOption
            :user-info="userInfo"
            @open-setting="openSetting"
            @logout="handleLogout"
          />
        </template>

        <template #tab>
          <div class="flex items-center justify-between">
            <div class="flex-1 w-[1px]">
              <Tabs />
            </div>
            <TabToolbar />
          </div>
        </template>

        <template #view>
          <ContentView />
        </template>
      </Layout>
      <SettingDrawer v-if="showSettingDrawer" v-model="settingActive" />
      <template v-if="useLockPage">
        <LayoutLockScreen
          :user-info="userInfo"
          :verify-password="verifyPassword"
          @logout="handleLogout"
        />
        <LayoutAutoLocker/>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Layout, LayoutLogo, SettingDrawer, Menu, Breadcrumb, ContentView, Tabs, TabToolbar, LayoutHeaderOption, LayoutLockScreen, LayoutAutoLocker } from '@grow-admin-rock/layouts'
import { Layout, LayoutLogo, SettingDrawer, Menu, Breadcrumb, ContentView, Tabs, TabToolbar, LayoutHeaderOption, LayoutLockScreen, LayoutAutoLocker } from '@grow-admin-rock/layouts'
import { storeToRefs, useAppConfig, useAppStore, useUserStore, useLayout } from '@grow-admin-rock/state'
import { useAppBootstrap } from './use/useAppBootstrap'
import { useHomeLayout } from './use/useHomeLayout'
import { useUserLogout } from './use/useUserLogout'
import { useScreenUnlock } from './use/useScreenUnlock'
import { useScreenUnlock } from './use/useScreenUnlock'

useAppBootstrap()
useHomeLayout()

const appConfig = useAppConfig()
const appStore = useAppStore()
const userStore = useUserStore()
const { layoutType } = useLayout()
const { showSettingDrawer, useLockPage } = storeToRefs(appConfig)
const { showSettingDrawer, useLockPage } = storeToRefs(appConfig)
const { settingActive } = storeToRefs(appStore)
const { userInfo } = storeToRefs(userStore)
const { handleLogout } = useUserLogout()
const { verifyPassword } = useScreenUnlock()
const { verifyPassword } = useScreenUnlock()

function openSetting() {
  appStore.setSettingActive(true)
}
</script>
