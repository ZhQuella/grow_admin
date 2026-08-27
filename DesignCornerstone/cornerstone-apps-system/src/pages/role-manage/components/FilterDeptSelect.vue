<template>
  <GrowSelect
    :model-value="modelValue"
    :options="options"
    label="label"
    value="value"
    multiple
    filterable
    clearable
    collapse-tags
    placeholder="请选择"
    @update:model-value="onChange"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { SystemDeptTreeNode } from '../../../types/systemRole'

defineOptions({ name: 'FilterDeptSelect' })

const props = defineProps<{
  modelValue: string[]
  tree: SystemDeptTreeNode[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const options = computed(() => {
  const result: Array<{ label: string; value: string }> = []
  const walk = (nodes: SystemDeptTreeNode[], prefix: string) => {
    for (const node of nodes) {
      const label = prefix ? `${prefix} / ${node.title}` : node.title
      result.push({ value: node.id, label })
      if (node.children?.length) walk(node.children, label)
    }
  }
  walk(props.tree, '')
  return result
})

function onChange(value: unknown) {
  emit('update:modelValue', Array.isArray(value) ? value.map((item) => String(item)) : [])
}
</script>
