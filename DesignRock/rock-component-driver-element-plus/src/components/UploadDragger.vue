<template><el-upload v-bind="$attrs" drag><slot /></el-upload></template>
<script lang="ts" setup>
import { ElUpload } from 'element-plus'
defineOptions({ name: 'UploadDragger' })
</script>