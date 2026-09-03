<script setup lang="ts">
import { LOCALE, useLocale } from '@grow-admin-rock/locale'
import { useAppConfig, useLayout } from '@grow-admin-rock/state'
import { ref } from 'vue'
import LayoutSelect from './LayoutSelect.vue'
import SettingAnimation from './SettingAnimation.vue'
import SettingTheme from './SettingTheme.vue'
import SwitchLanguage from './SwitchLanguage.vue'

const { getLocale, changeLocale } = useLocale()
const appConfig = useAppConfig()
const { resetLayoutType } = useLayout()

const settingThemeRef = ref<InstanceType<typeof SettingTheme>>()
const settingAnimationRef = ref<InstanceType<typeof SettingAnimation>>()

async function resetConfig() {
  appConfig.$reset()
  resetLayoutType()
  settingThemeRef.value?.resetTheme()
  settingAnimationRef.value?.resetAnimation()
  await changeLocale(LOCALE.zh)
}

defineExpose({ resetConfig })
</script>

<template>
  <div :key="getLocale">
    <SettingTheme ref="settingThemeRef" />

    <GrowDivider />

    <SwitchLanguage />

    <GrowDivider />

    <LayoutSelect />

    <GrowDivider />

    <SettingAnimation ref="settingAnimationRef" />
  </div>
</template>
