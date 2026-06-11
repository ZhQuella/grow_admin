<script lang="ts" setup>
import { ThemeEnum, ThemeModeEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { resolveThemeMode, storeToRefs, useAppConfig } from '@grow-admin-rock/state'
import { computed } from 'vue'

const { t } = useI18n()
const appConfig = useAppConfig()
const { themeMode } = storeToRefs(appConfig)

const isDark = computed(() => resolveThemeMode(themeMode.value) === ThemeEnum.DARK)

function onThemeSwitch(value: boolean) {
  appConfig.setThemeMode(value ? ThemeModeEnum.DARK : ThemeModeEnum.LIGHT)
}
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-2 surface-panel shadow-card">
    <span class="text-[13px] text-muted shrink-0 select-none">
      {{ t('layout.login.darkMode') }}
    </span>
    <GrowSwitch :model-value="isDark" @update:model-value="onThemeSwitch" />
  </div>
</template>
