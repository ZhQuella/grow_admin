<template><a-col v-bind="$attrs"><slot /></a-col></template>
<script lang="ts" setup>
import { Col as ACol } from 'ant-design-vue'
defineOptions({ name: 'GridItem' })
</script>