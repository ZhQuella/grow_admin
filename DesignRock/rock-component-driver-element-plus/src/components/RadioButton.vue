<template><el-radio-button v-bind="$attrs"><slot /></el-radio-button></template>
<script lang="ts" setup>
import { ElRadioButton } from 'element-plus'
defineOptions({ name: 'RadioButton' })
</script>