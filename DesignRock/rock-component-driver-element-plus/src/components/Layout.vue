<template><el-container v-bind="$attrs"><slot /></el-container></template>
<script lang="ts" setup>
import { ElContainer } from 'element-plus'
defineOptions({ name: 'Layout' })
</script>