<template><el-col v-bind="$attrs"><slot /></el-col></template>
<script lang="ts" setup>
import { ElCol } from 'element-plus'
defineOptions({ name: 'GridItem' })
</script>