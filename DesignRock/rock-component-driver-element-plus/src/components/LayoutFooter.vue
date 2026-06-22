<template><el-footer v-bind="$attrs"><slot /></el-footer></template>
<script lang="ts" setup>
import { ElFooter } from 'element-plus'
defineOptions({ name: 'LayoutFooter' })
</script>