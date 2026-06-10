<template><el-icon class="is-loading" v-bind="$attrs"><Loading /></el-icon></template>
<script lang="ts" setup>
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
defineOptions({ name: 'Spinner' })
</script>