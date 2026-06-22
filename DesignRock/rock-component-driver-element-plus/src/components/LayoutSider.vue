<template><el-aside v-bind="$attrs"><slot /></el-aside></template>
<script lang="ts" setup>
import { ElAside } from 'element-plus'
defineOptions({ name: 'LayoutSider' })
</script>