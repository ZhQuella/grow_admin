<template>
  <div class="mt-3 border-t border-solid border-border pt-3">
    <div class="mb-1.5 flex items-center gap-1">
      <span class="text-sm text-text">默认数据</span>
      <GrowTooltip
        content="该默认数据，不包含success、content一层，可直接用于首屏渲染"
        placement="top"
      >
        <GrowIconify icon="carbon:help" :size="14" class="cursor-help text-text-secondary" />
      </GrowTooltip>
    </div>
    <p class="mb-2 mt-0 text-xs leading-relaxed text-text-secondary">
      输入框内默认支持变量，写法和 JS 写法完全一致。
      <DataExamplePopover />
    </p>
    <div class="h-40 overflow-hidden rounded border border-solid border-border">
      <GrowCodeEditor
        :model-value="modelValue"
        class="h-full"
        default-language="expression"
        :language-switchable="false"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import DataExamplePopover from '../shared/DataExamplePopover.vue'

defineOptions({ name: 'ApiDefaultData' })

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
