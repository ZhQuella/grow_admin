<template>
  <div class="h-[100vh] transition-all duration-500">
    <div class="h-full bg-[var(--layout-container-background-color)] overflow-hidden">
      <Layout>
        <template #logo>
          <LayoutLogo />
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
        </template>

        <template #menu>
          <div id="grow-menu"></div>
        </template>

        <template #bread>
          <div id="grow-bread"></div>
        </template>

        <template #view>
          <router-view />
        </template>

      </Layout>
      <SettingDrawer v-if="showSettingDrawer" v-model="settingActive" />
    </div>
  </div>

  <Teleport to="#grow-menu">
    <Menu />
  </Teleport>

  <Teleport to="#grow-bread">
    <Breadcrumb />
  </Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Layout, LayoutLogo, SettingDrawer, Menu, Breadcrumb } from '@grow-admin-rock/layouts'
import { SettingButtonPositionEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig, useAppStore } from '@grow-admin-rock/state'
import { useAppBootstrap } from './use/useAppBootstrap'

useAppBootstrap()

const { t } = useI18n()
const appConfig = useAppConfig()
const appStore = useAppStore()
const { showSettingButton, showSettingDrawer, settingButtonPosition } = storeToRefs(appConfig)
const { settingActive } = storeToRefs(appStore)

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