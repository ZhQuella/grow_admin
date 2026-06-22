<template><a-modal v-bind="$attrs"><slot /></a-modal></template>
<script lang="ts" setup>
import { Modal as AModal } from 'ant-design-vue'
defineOptions({ name: 'Dialog' })
</script>