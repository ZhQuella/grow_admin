<template><a-radio-group v-bind="$attrs" option-type="button"><slot /></a-radio-group></template>
<script lang="ts" setup>
import { Radio } from 'ant-design-vue'
const ARadioGroup = Radio.Group
defineOptions({ name: 'RadioButtonGroup' })
</script>