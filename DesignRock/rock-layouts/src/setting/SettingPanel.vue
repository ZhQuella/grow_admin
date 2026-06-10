<script setup lang="ts">
import {
  APP_THEME_COLOR_LIST,
  RouterTransitionEnum,
  ThemeModeEnum,
} from '@grow-admin-rock/constants'
import { storeToRefs, useAppConfig } from '@grow-admin-rock/state'

const emit = defineEmits<{
  close: []
}>()

const appConfig = useAppConfig()
const { themeMode, themeColor, transition } = storeToRefs(appConfig)

const themeModeOptions = [
  { label: '亮色', value: ThemeModeEnum.LIGHT },
  { label: '暗色', value: ThemeModeEnum.DARK },
  { label: '跟随系统', value: ThemeModeEnum.SYSTEM },
]

const transitionOptions = Object.values(RouterTransitionEnum).map((value) => ({
  label: value,
  value,
}))

function resetConfig() {
  appConfig.$reset()
  appConfig.setThemeMode(ThemeModeEnum.SYSTEM)
  appConfig.setThemeColor('#8b5cf6')
}
</script>

<template>
  <section class="grow-setting-drawer__section">
    <h4 class="grow-setting-drawer__title">主题模式</h4>
    <GrowRadioGroup
      :model-value="themeMode"
      :options="themeModeOptions"
      @update:model-value="appConfig.setThemeMode"
    />
  </section>

  <section class="grow-setting-drawer__section">
    <h4 class="grow-setting-drawer__title">主题色</h4>
    <div class="grow-setting-drawer__colors">
      <button
        v-for="color in APP_THEME_COLOR_LIST"
        :key="color"
        type="button"
        class="grow-setting-drawer__color"
        :class="{ 'is-active': themeColor === color }"
        :style="{ backgroundColor: color }"
        @click="appConfig.setThemeColor(color)"
      />
    </div>
  </section>

  <GrowDivider />

  <section class="grow-setting-drawer__section">
    <h4 class="grow-setting-drawer__title">动画</h4>
    <div class="grow-setting-drawer__row">
      <span>切换动画</span>
      <GrowSwitch
        :model-value="transition.enable"
        @update:model-value="(value) => appConfig.setTransition({ enable: value })"
      />
    </div>
    <div class="grow-setting-drawer__row">
      <span>动画类型</span>
      <GrowSelect
        :model-value="transition.basicTransition"
        :options="transitionOptions"
        style="width: 140px"
        @update:model-value="(value) => appConfig.setTransition({ basicTransition: value })"
      />
    </div>
  </section>

  <div class="grow-setting-drawer__footer">
    <GrowButton @click="resetConfig">重置配置</GrowButton>
    <GrowButton type="primary" @click="emit('close')">关闭</GrowButton>
  </div>
</template>
