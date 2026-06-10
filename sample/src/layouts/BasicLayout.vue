<script setup lang="ts">
import { computed } from 'vue'
import { SettingDrawer } from '@grow-admin-rock/layouts'
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { resolveThemeMode, storeToRefs, useAppConfig } from '@grow-admin-rock/state'

const appConfig = useAppConfig()
const {
  header,
  sidebar,
  showThemeModeToggle,
  showSettingButton,
  showSettingDrawer,
  themeMode,
} = storeToRefs(appConfig)

const themeToggleLabel = computed(() => {
  if (themeMode.value === ThemeModeEnum.SYSTEM) return '跟随系统'
  return resolveThemeMode(themeMode.value) === ThemeEnum.DARK ? '暗色' : '亮色'
})

function toggleThemeMode() {
  if (themeMode.value === ThemeModeEnum.LIGHT) {
    appConfig.setThemeMode(ThemeModeEnum.DARK)
    return
  }
  if (themeMode.value === ThemeModeEnum.DARK) {
    appConfig.setThemeMode(ThemeModeEnum.SYSTEM)
    return
  }
  appConfig.setThemeMode(ThemeModeEnum.LIGHT)
}

function openSettingDrawer() {
  appConfig.setOpenSettingDrawer(true)
}
</script>

<template>
  <GrowLayout class="grow-admin-layout">
    <GrowLayoutHeader
      v-if="header.show"
      class="grow-admin-layout__header"
      :style="{
        background: header.theme === ThemeEnum.DARK ? '#151515' : 'var(--header-background-color)',
        color: header.theme === ThemeEnum.DARK ? '#fff' : 'var(--header-text-color)',
      }"
    >
      <div class="grow-admin-layout__header-title">Grow Admin Sample</div>
      <div class="grow-admin-layout__header-actions">
        <GrowButton v-if="showThemeModeToggle" @click="toggleThemeMode">
          {{ themeToggleLabel }}
        </GrowButton>
        <GrowButton v-if="showSettingButton" type="primary" @click="openSettingDrawer">
          项目配置
        </GrowButton>
      </div>
    </GrowLayoutHeader>

    <GrowLayout>
      <GrowLayoutSider
        v-if="sidebar.show"
        class="grow-admin-layout__sider"
        :width="sidebar.width"
        :style="{
          background:
            sidebar.theme === ThemeEnum.DARK ? sidebar.bgColor : 'var(--component-background-color)',
          color: sidebar.theme === ThemeEnum.DARK ? '#fff' : 'var(--text-color)',
        }"
      >
        <div class="p-4 text-sm opacity-80">导航菜单占位</div>
      </GrowLayoutSider>

      <GrowLayoutContent class="grow-admin-layout__content">
        <router-view />
      </GrowLayoutContent>
    </GrowLayout>

    <SettingDrawer v-if="showSettingDrawer" />
  </GrowLayout>
</template>
