<template><el-main v-bind="$attrs"><slot /></el-main></template>
<script lang="ts" setup>
import { ElMain } from 'element-plus'
defineOptions({ name: 'LayoutContent' })
</script>