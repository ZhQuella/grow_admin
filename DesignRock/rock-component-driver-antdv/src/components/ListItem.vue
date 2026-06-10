<template><a-list-item v-bind="$attrs"><slot /></a-list-item></template>
<script lang="ts" setup>
import { List } from 'ant-design-vue'
const AListItem = List.Item
defineOptions({ name: 'ListItem' })
</script>