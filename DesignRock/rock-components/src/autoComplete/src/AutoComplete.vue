<script lang="ts" setup>
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { computed, ref } from 'vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.AutoComplete,
})
const AutoComplete = useDriverComponent(RockComponent.AutoComplete)
const hasDriver = computed(() => Boolean(AutoComplete))
</script>
<template>
  <component
    v-if="hasDriver"
    :is="AutoComplete"
    v-bind="$attrs"
    :ref="DriverRefKey"
    class="grow-auto-complete"
  >
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
  <div v-else class="grow-auto-complete-missing">AutoComplete 驱动未注入（请硬刷新页面）</div>
</template>

<style scoped>
.grow-auto-complete,
.grow-auto-complete-missing {
  width: 100%;
  display: inline-block;
  box-sizing: border-box;
}
.grow-auto-complete-missing {
  padding: 8px 12px;
  border: 1px dashed var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  color: var(--text-color-secondary, #909399);
  font-size: 12px;
}
</style>
