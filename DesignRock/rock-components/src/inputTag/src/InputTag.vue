<script lang="ts" setup>
/**
 * GrowInputTag：契约组件，Element Plus 驱动映射为 ElInputTag。
 */
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { ref } from 'vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.InputTag,
})
const InputTag = useDriverComponent(RockComponent.InputTag)
</script>
<template>
  <component :is="InputTag" v-bind="$attrs" :ref="DriverRefKey">
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>
