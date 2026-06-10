<script setup lang="ts">
import { computed, inject } from 'vue'
import { storeToRefs, resolveThemeMode, useAppConfig } from '@grow-admin-rock/state'
import { ThemeEnum } from '@grow-admin-rock/constants'
import { OPEN_PROJECT_SETTING_KEY } from '@/constants/setting'

const { themeMode, themeColor, showSettingButton } = storeToRefs(useAppConfig())
const resolvedTheme = computed(() => resolveThemeMode(themeMode.value))
const isDark = computed(() => resolvedTheme.value === ThemeEnum.DARK)
const openProjectSetting = inject<( () => void) | undefined>(OPEN_PROJECT_SETTING_KEY)
</script>

<template>
  <GrowCard>
    <template #header>主题演示</template>
    <GrowSpace direction="vertical">
      <div>当前模式：{{ themeMode }}</div>
      <div>解析结果：{{ resolvedTheme }}</div>
      <div>是否暗色：{{ isDark ? '是' : '否' }}</div>
      <div>主题色：{{ themeColor }}</div>
      <div class="text-sm opacity-70">
        可通过顶栏或下方按钮打开「项目配置」抽屉进行完整设置。
      </div>
      <GrowButton v-if="showSettingButton" type="primary" @click="openProjectSetting?.()">
        项目配置
      </GrowButton>
    </GrowSpace>
  </GrowCard>
</template>
