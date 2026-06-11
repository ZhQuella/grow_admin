<script setup lang="ts">
import {
  APP_THEME_COLOR_LIST,
  RouterTransitionEnum,
  ThemeModeEnum,
} from '@grow-admin-rock/constants'
import { LOCALE, useI18n, useLocale } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig } from '@grow-admin-rock/state'
import { computed } from 'vue'
import SwitchLanguage from './SwitchLanguage.vue'

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const { getLocale, changeLocale } = useLocale()
const appConfig = useAppConfig()
const { themeMode, themeColor, transition } = storeToRefs(appConfig)

const themeModeOptions = computed(() => [
  { label: t('layout.setting.themeLight'), value: ThemeModeEnum.LIGHT },
  { label: t('layout.setting.themeDark'), value: ThemeModeEnum.DARK },
  { label: t('layout.setting.themeSystem'), value: ThemeModeEnum.SYSTEM },
])

const transitionOptions = computed(() =>
  Object.values(RouterTransitionEnum).map((value) => ({
    label: t(`layout.setting.transition.${value}`),
    value,
  })),
)

async function resetConfig() {
  appConfig.$reset()
  appConfig.setThemeMode(ThemeModeEnum.SYSTEM)
  appConfig.setThemeColor('#8b5cf6')
  await changeLocale(LOCALE.zh)
}
</script>

<template>
  <div :key="getLocale">
    <section class="mb-5">
      <h4 class="m-0 mb-3 text-sm font-semibold text-text">
        {{ t('layout.setting.themeMode') }}
      </h4>
      <GrowRadioGroup
        :model-value="themeMode"
        :options="themeModeOptions"
        @update:model-value="appConfig.setThemeMode"
      />
    </section>

    <section class="mb-5">
      <h4 class="m-0 mb-3 text-sm font-semibold text-text">
        {{ t('layout.setting.themeColor') }}
      </h4>
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
    </section>

    <GrowDivider />

    <section class="mb-5">
      <h4 class="m-0 mb-3 text-sm font-semibold text-text">
        {{ t('layout.setting.language') }}
      </h4>
      <SwitchLanguage :show-label="false" select-class="w-full" :inline="false" />
    </section>

    <GrowDivider />

    <section class="mb-5">
      <h4 class="m-0 mb-3 text-sm font-semibold text-text">
        {{ t('layout.setting.animation') }}
      </h4>
      <div class="mb-2 flex min-h-8 items-center justify-between gap-3 text-[13px] text-text-secondary">
        <span>{{ t('layout.setting.transitionEnable') }}</span>
        <GrowSwitch
          :model-value="transition.enable"
          @update:model-value="(value) => appConfig.setTransition({ enable: value })"
        />
      </div>
      <div class="mb-2 flex min-h-8 items-center justify-between gap-3 text-[13px] text-text-secondary">
        <span>{{ t('layout.setting.transitionType') }}</span>
        <GrowSelect
          class="w-[140px]"
          :model-value="transition.basicTransition"
          :options="transitionOptions"
          @update:model-value="(value) => appConfig.setTransition({ basicTransition: value })"
        />
      </div>
    </section>

    <div class="mt-6 flex justify-end gap-2">
      <GrowButton @click="resetConfig">{{ t('layout.setting.reset') }}</GrowButton>
      <GrowButton type="primary" @click="emit('close')">{{ t('layout.setting.close') }}</GrowButton>
    </div>
  </div>
</template>
