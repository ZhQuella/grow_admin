<template>
  <ElConfigProvider :locale="zhCn" v-bind="$attrs">
    <slot />
  </ElConfigProvider>
</template>
<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useTheme } from '@grow-admin-rock/state'

defineOptions({ name: 'Config' })

useTheme()
</script>
