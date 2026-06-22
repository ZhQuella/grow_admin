<template><el-header v-bind="$attrs"><slot /></el-header></template>
<script lang="ts" setup>
import { ElHeader } from 'element-plus'
defineOptions({ name: 'LayoutHeader' })
</script>