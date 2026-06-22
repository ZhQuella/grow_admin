<template>
  <NConfigProvider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="isDark ? darkTheme : undefined"
    :theme-overrides="naiveThemeOverrides"
  >
    <slot />
  </NConfigProvider>
</template>
<script lang="ts" setup>
import { NConfigProvider, darkTheme, dateZhCN, zhCN } from 'naive-ui'
import { useTheme } from '@grow-admin-rock/state'

defineOptions({ name: 'Config' })

const { isDark, naiveThemeOverrides } = useTheme()
</script>
