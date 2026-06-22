<template><a-row v-bind="$attrs"><slot /></a-row></template>
<script lang="ts" setup>
import { Row as ARow } from 'ant-design-vue'
defineOptions({ name: 'Grid' })
</script>