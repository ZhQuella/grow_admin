<template>
  <ElRadioGroup v-bind="groupAttrs">
    <slot>
      <ElRadioButton
        v-for="item in options || []"
        :key="String(item.value)"
        :label="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </ElRadioButton>
    </slot>
  </ElRadioGroup>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { ElRadioButton, ElRadioGroup } from 'element-plus'

defineOptions({ name: 'RadioButtonGroup', inheritAttrs: false })

defineProps<{
  options?: Array<{ label: string; value: string | number | boolean }>
}>()

const attrs = useAttrs()
const groupAttrs = computed(() => {
  const { options: _options, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
