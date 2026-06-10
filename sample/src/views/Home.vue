<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs, resolveThemeMode, useAppConfig } from '@grow-admin-rock/state'
import { ThemeEnum } from '@grow-admin-rock/constants'

const { themeMode, themeColor } = storeToRefs(useAppConfig())
const resolvedTheme = computed(() => resolveThemeMode(themeMode.value))
const isDark = computed(() => resolvedTheme.value === ThemeEnum.DARK)
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
        可通过右上角按钮切换亮暗，或打开「项目配置」抽屉进行完整设置。
      </div>
    </GrowSpace>
  </GrowCard>
</template>
