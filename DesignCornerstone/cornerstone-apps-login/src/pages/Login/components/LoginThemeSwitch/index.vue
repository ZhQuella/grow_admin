<script lang="ts" setup>
import { ThemeModeEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { useAppConfig, useTheme } from '@grow-admin-rock/state'
import { computed } from 'vue'

const { t } = useI18n()
const appConfig = useAppConfig()
const { isDark } = useTheme()

const themeIcon = computed(() =>
  isDark.value ? 'ant-design:sun-outlined' : 'ant-design:moon-outlined',
)

function toggleTheme() {
  appConfig.setThemeMode(isDark.value ? ThemeModeEnum.LIGHT : ThemeModeEnum.DARK)
}
</script>

<template>
  <GrowButton
    circle
    class="login-interactive-icon !h-9 !w-9 border border-border bg-component text-text-secondary"
    :aria-label="t('layout.login.darkMode')"
    :title="t('layout.login.darkMode')"
    @click="toggleTheme"
  >
    <GrowIconify :icon="themeIcon" :size="20" hover-pointer />
  </GrowButton>
</template>
