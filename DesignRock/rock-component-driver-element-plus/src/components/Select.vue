<template>
  <!-- TODO: 插槽 -->
  <ElSelect v-bind="$attrs">
    <ElOption v-for="item in $attrs.options" :key="item.value" :label="item.label" :value="item.value"></ElOption>
  </ElSelect>
</template>
<script lang="ts" name="ElSelect" setup>
import { ElSelect, ElOption} from 'element-plus';
// TODO: 补充插槽，以及自定义字段等逻辑
</script>