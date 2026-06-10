<template><a-config-provider v-bind="$attrs"><slot /></a-config-provider></template>
<script lang="ts" setup>
import { ConfigProvider as AConfigProvider } from 'ant-design-vue'
defineOptions({ name: 'Config' })
</script>