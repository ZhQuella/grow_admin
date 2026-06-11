<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { SettingDrawer } from '@grow-admin-rock/layouts'
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { resolveThemeMode, storeToRefs, useAppConfig } from '@grow-admin-rock/state'

import { OPEN_PROJECT_SETTING_KEY } from '@/constants/setting'

const appConfig = useAppConfig()
const settingVisible = ref(false)
const {
  showThemeModeToggle,
  showSettingButton,
  showSettingDrawer,
  themeMode,
} = storeToRefs(appConfig)

provide(OPEN_PROJECT_SETTING_KEY, () => {
  settingVisible.value = true
})

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
</script>

<template>
  <GrowLayout class="h-full w-full bg-layout text-text">
    <GrowLayoutHeader
      class="flex h-[var(--header-height)] items-center justify-between border-b border-border px-4"
      :style="{
        background: '#151515',
        color: '#fff',
      }"
    >
      <div class="text-base font-semibold">Grow Admin Sample</div>
      <div class="flex items-center gap-2">
        <GrowButton v-if="showThemeModeToggle" @click="toggleThemeMode">
          {{ themeToggleLabel }}
        </GrowButton>
        <GrowButton v-if="showSettingButton" type="primary" @click="settingVisible = true">
          项目配置
        </GrowButton>
      </div>
    </GrowLayoutHeader>

    <GrowLayout>
      <GrowLayoutSider
        class="border-r border-border"
        :width="210"
        :style="{
          background: '#001529',
          color: '#fff',
        }"
      >
        <div class="p-4 text-sm opacity-80">导航菜单占位</div>
      </GrowLayoutSider>

      <GrowLayoutContent class="min-h-[calc(100vh-var(--header-height))] bg-[var(--main-background-color)] p-4">
        <router-view />
      </GrowLayoutContent>
    </GrowLayout>

    <SettingDrawer v-if="showSettingDrawer" v-model="settingVisible" />
  </GrowLayout>
</template>
