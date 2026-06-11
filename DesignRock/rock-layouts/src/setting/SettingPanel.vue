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
  <section class="mb-5">
    <h4 class="m-0 mb-3 text-sm font-semibold text-text">主题模式</h4>
    <GrowRadioGroup
      :model-value="themeMode"
      :options="themeModeOptions"
      @update:model-value="appConfig.setThemeMode"
    />
  </section>

  <section class="mb-5">
    <h4 class="m-0 mb-3 text-sm font-semibold text-text">主题色</h4>
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
    <h4 class="m-0 mb-3 text-sm font-semibold text-text">动画</h4>
    <div class="mb-2 flex min-h-8 items-center justify-between gap-3 text-[13px] text-text-secondary">
      <span>切换动画</span>
      <GrowSwitch
        :model-value="transition.enable"
        @update:model-value="(value) => appConfig.setTransition({ enable: value })"
      />
    </div>
    <div class="mb-2 flex min-h-8 items-center justify-between gap-3 text-[13px] text-text-secondary">
      <span>动画类型</span>
      <GrowSelect
        class="w-[140px]"
        :model-value="transition.basicTransition"
        :options="transitionOptions"
        @update:model-value="(value) => appConfig.setTransition({ basicTransition: value })"
      />
    </div>
  </section>

  <div class="mt-6 flex justify-end gap-2">
    <GrowButton @click="resetConfig">重置配置</GrowButton>
    <GrowButton type="primary" @click="emit('close')">关闭</GrowButton>
  </div>
</template>
