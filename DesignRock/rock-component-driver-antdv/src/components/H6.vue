<template><a-typography-title :level="6" v-bind="$attrs"><slot /></a-typography-title></template>
<script lang="ts" setup>
import { Typography } from 'ant-design-vue'
const ATypographyTitle = Typography.Title
defineOptions({ name: 'H6' })
</script>