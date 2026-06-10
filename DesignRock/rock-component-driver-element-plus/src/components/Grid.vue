<template><el-row v-bind="$attrs"><slot /></el-row></template>
<script lang="ts" setup>
import { ElRow } from 'element-plus'
defineOptions({ name: 'Grid' })
</script>