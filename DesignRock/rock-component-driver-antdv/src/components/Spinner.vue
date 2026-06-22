<template><a-spin v-bind="$attrs"><slot /></a-spin></template>
<script lang="ts" setup>
import { Spin as ASpin } from 'ant-design-vue'
defineOptions({ name: 'Spinner' })
</script>