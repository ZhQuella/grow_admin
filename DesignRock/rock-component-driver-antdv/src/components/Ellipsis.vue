<template><a-typography-text v-bind="$attrs" :ellipsis="true"><slot /></a-typography-text></template>
<script lang="ts" setup>
import { Typography } from 'ant-design-vue'
const ATypographyText = Typography.Text
defineOptions({ name: 'Ellipsis' })
</script>