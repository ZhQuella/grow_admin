<script setup lang="ts">
import { APP_THEME_COLOR_LIST, ThemeModeEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig } from '@grow-admin-rock/state'
import { computed } from 'vue'

const { t } = useI18n()
const appConfig = useAppConfig()
const { themeMode, themeColor } = storeToRefs(appConfig)

const themeModeOptions = computed(() => [
  { label: t('layout.setting.themeLight'), value: ThemeModeEnum.LIGHT },
  { label: t('layout.setting.themeDark'), value: ThemeModeEnum.DARK },
  { label: t('layout.setting.themeSystem'), value: ThemeModeEnum.SYSTEM },
])

function resetTheme() {
  appConfig.setThemeMode(ThemeModeEnum.SYSTEM)
  appConfig.setThemeColor('#8b5cf6')
}

defineExpose({ resetTheme })
</script>

<template>
  <GrowForm label-width="100px" label-position="left" class="mb-5">
    <GrowFormItem :label="t('layout.setting.themeMode')">
      <GrowRadioGroup
        :model-value="themeMode"
        :options="themeModeOptions"
        @update:model-value="appConfig.setThemeMode"
      />
    </GrowFormItem>

    <GrowFormItem :label="t('layout.setting.themeColor')">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in APP_THEME_COLOR_LIST"
          :key="color"
          type="button"
          class="h-5 w-5 cursor-pointer rounded-sm border border-border transition-all hover:scale-[1.08] hover:border-[var(--primary-color-hover)]"
          :class="themeColor === color ? 'outline outline-2 outline-primary outline-offset-2' : ''"
          :style="{ backgroundColor: color }"
          @click="appConfig.setThemeColor(color)"
        />
      </div>
    </GrowFormItem>
  </GrowForm>
</template>
