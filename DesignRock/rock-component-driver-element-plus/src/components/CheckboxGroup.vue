<template>
  <ElCheckboxGroup v-bind="$attrs">
    <ElCheckbox v-for="item in $attrs.options" :key="item.value" :label="item.value">{{item.label}}</ElCheckbox>
  </ElCheckboxGroup>
</template>
<script lang="ts" name="ElCheckboxGroup" setup>
import { ElCheckbox, ElCheckboxGroup} from 'element-plus';
// TODO: 补充插槽，以及自定义字段，单个box是否禁用等等逻辑
</script>