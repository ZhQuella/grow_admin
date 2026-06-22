<template><a-upload-dragger v-bind="$attrs"><slot /></a-upload-dragger></template>
<script lang="ts" setup>
import { Upload } from 'ant-design-vue'
const AUploadDragger = Upload.Dragger
defineOptions({ name: 'UploadDragger' })
</script>