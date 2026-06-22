<template><a-typography-text v-bind="$attrs"><slot /></a-typography-text></template>
<script lang="ts" setup>
import { Typography } from 'ant-design-vue'
const ATypographyText = Typography.Text
defineOptions({ name: 'Text' })
</script>