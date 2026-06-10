<template>
  <!-- TODO: 插槽 -->
  <ElConfigProvider :locale="zhCn" v-bind="$attrs">
    <slot />
  </ElConfigProvider>
</template>
<script lang="ts" name="ElConfigProvider" setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>
