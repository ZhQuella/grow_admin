<template>
  <ElCheckboxGroup v-bind="groupAttrs">
    <slot>
      <ElCheckbox
        v-for="item in options || []"
        :key="String(item.value)"
        :label="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </ElCheckbox>
    </slot>
  </ElCheckboxGroup>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'

defineOptions({ name: 'CheckboxGroup', inheritAttrs: false })

defineProps<{
  options?: Array<{ label: string; value: string | number | boolean }>
}>()

const attrs = useAttrs()
const groupAttrs = computed(() => {
  const { options: _options, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
