<template>
  <AConfigProvider :theme="antdTheme">
    <slot />
  </AConfigProvider>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { ConfigProvider as AConfigProvider, theme as antThemeApi } from 'ant-design-vue'
import { useTheme } from '@grow-admin-rock/state'

defineOptions({ name: 'Config' })

const { isDark, themePalette } = useTheme()

const antdTheme = computed(() => ({
  algorithm: isDark.value ? antThemeApi.darkAlgorithm : antThemeApi.defaultAlgorithm,
  token: {
    colorPrimary: themePalette.value.primary,
    colorPrimaryHover: themePalette.value.hover,
    colorPrimaryActive: themePalette.value.active,
    colorPrimaryBg: themePalette.value.light9,
    colorPrimaryBgHover: themePalette.value.light8,
    colorPrimaryBorder: themePalette.value.light5,
    colorPrimaryBorderHover: themePalette.value.light3,
  },
}))
</script>
