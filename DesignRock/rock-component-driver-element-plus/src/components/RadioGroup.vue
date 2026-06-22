<template>
  <ElRadioGroup v-bind="$attrs">
    <ElRadio v-for="item in $attrs.options" :key="item.value" :label="item.value">{{item.label}}</ElRadio>
  </ElRadioGroup>
</template>
<script lang="ts" name="ElRadioButtonGroup" setup>
import { ElRadio, ElRadioGroup} from 'element-plus';
// TODO: 补充插槽，以及自定义字段，单个box是否禁用等等逻辑
</script>