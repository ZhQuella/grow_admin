<script lang="ts" setup>
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { computed, ref } from 'vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.AutoComplete,
  inheritAttrs: false,
})
const AutoComplete = useDriverComponent(RockComponent.AutoComplete)
const hasDriver = computed(() => Boolean(AutoComplete))
</script>
<template>
  <!-- 外层占整行，对齐 GrowInput；EP Autocomplete 根节点是 Tooltip，需由容器撑满 -->
  <div class="grow-auto-complete">
    <component
      v-if="hasDriver"
      :is="AutoComplete"
      v-bind="$attrs"
      :ref="DriverRefKey"
      class="grow-auto-complete__control"
    >
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <slot :name="item" v-bind="data || {}" />
      </template>
    </component>
    <div v-else class="grow-auto-complete-missing">AutoComplete 驱动未注入（请硬刷新页面）</div>
  </div>
</template>

<style scoped>
.grow-auto-complete {
  width: 100%;
  display: block;
  box-sizing: border-box;
}

.grow-auto-complete__control {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Element Plus：Tooltip 触发器 / autocomplete / 内部 input 均拉满 */
.grow-auto-complete :deep(.el-tooltip__trigger),
.grow-auto-complete :deep(.el-only-child),
.grow-auto-complete :deep(.el-autocomplete),
.grow-auto-complete :deep(.el-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Naive：与输入框一致占满容器 */
.grow-auto-complete :deep(.n-auto-complete) {
  width: 100%;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
}

.grow-auto-complete-missing {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px dashed var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  color: var(--text-color-secondary, #909399);
  font-size: 12px;
}
</style>
