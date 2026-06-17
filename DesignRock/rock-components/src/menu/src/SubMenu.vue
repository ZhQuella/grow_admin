<script lang="ts" setup>
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { ref } from 'vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.SubMenu,
})
const SubMenu = useDriverComponent(RockComponent.SubMenu)
</script>
<template>
  <component :is="SubMenu" v-bind="$attrs" :ref="DriverRefKey">
    <template #title>
      <slot name="title" />
    </template>
    <template #[item]="data" v-for="item in Object.keys($slots).filter((name) => name !== 'title')" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>
