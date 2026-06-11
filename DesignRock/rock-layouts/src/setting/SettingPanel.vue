<script setup lang="ts">
import { LOCALE, useI18n, useLocale } from '@grow-admin-rock/locale'
import { useAppConfig } from '@grow-admin-rock/state'
import { ref } from 'vue'
import SettingAnimation from './SettingAnimation.vue'
import SettingTheme from './SettingTheme.vue'
import SwitchLanguage from './SwitchLanguage.vue'

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const { getLocale, changeLocale } = useLocale()
const appConfig = useAppConfig()

const settingThemeRef = ref<InstanceType<typeof SettingTheme>>()
const settingAnimationRef = ref<InstanceType<typeof SettingAnimation>>()

async function resetConfig() {
  appConfig.$reset()
  settingThemeRef.value?.resetTheme()
  settingAnimationRef.value?.resetAnimation()
  await changeLocale(LOCALE.zh)
}
</script>

<template>
  <div :key="getLocale">
    <SettingTheme ref="settingThemeRef" />

    <GrowDivider />

    <SwitchLanguage />

    <GrowDivider />

    <SettingAnimation ref="settingAnimationRef" />

    <div class="mt-6 flex justify-end gap-2">
      <GrowButton @click="resetConfig">{{ t('layout.setting.reset') }}</GrowButton>
      <GrowButton type="primary" @click="emit('close')">{{ t('layout.setting.close') }}</GrowButton>
    </div>
  </div>
</template>
