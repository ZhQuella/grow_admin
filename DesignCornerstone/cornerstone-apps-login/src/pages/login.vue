<script lang="ts" setup>
import { computed, ref } from 'vue'
import { SettingDrawer } from '@grow-admin-rock/layouts'
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { resolveThemeMode, storeToRefs, useAppConfig } from '@grow-admin-rock/state'

const appConfig = useAppConfig()
const settingVisible = ref(false)
const { themeMode } = storeToRefs(appConfig)

const isDark = computed(() => resolveThemeMode(themeMode.value) === ThemeEnum.DARK)

function onThemeSwitch(value: boolean) {
  appConfig.setThemeMode(value ? ThemeModeEnum.DARK : ThemeModeEnum.LIGHT)
}
</script>

<template>
  <div class="relative flex-center min-h-screen p-6 bg-layout text-text">
    <div class="fixed top-4 right-4 z-10 flex flex-col items-stretch gap-2">
      <div class="flex items-center gap-2 px-3 py-2 surface-panel shadow-card">
        <span class="text-[13px] text-muted select-none">暗色模式</span>
        <GrowSwitch :model-value="isDark" @update:model-value="onThemeSwitch" />
      </div>
      <GrowButton type="primary" @click="settingVisible = true">项目配置</GrowButton>
    </div>

    <div class="box-card w-full max-w-[400px] p-8 surface-panel shadow-card">
      <h1 class="m-0 mb-2 text-2xl font-semibold text-text">登录</h1>
      <p class="m-0 text-sm text-muted">Grow Admin 示例登录页</p>
    </div>

    <SettingDrawer v-model="settingVisible" />
  </div>
</template>
