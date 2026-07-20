<template>
  <div class="mt-1 border-t border-solid border-border pt-3">
    <div class="mb-1.5 flex items-center justify-between">
      <span class="text-sm text-text">数据处理</span>
      <GrowDropdown
        trigger="click"
        placement="bottom-end"
        :disabled="!availableOptions.length"
        @command="onAdd"
      >
        <GrowButton
          text
          size="small"
          title="添加处理函数"
          aria-label="添加处理函数"
          :disabled="!availableOptions.length"
        >
          <GrowIconify icon="carbon:add" :size="16" />
        </GrowButton>
        <template #dropdown>
          <GrowDropdownMenu>
            <GrowDropdownItem
              v-for="option in processorTypeOptions"
              :key="option.type"
              :command="option.type"
              :disabled="isTypeAdded(option.type)"
            >
              {{ option.label }}
            </GrowDropdownItem>
          </GrowDropdownMenu>
        </template>
      </GrowDropdown>
    </div>
    <p v-if="!modelValue.length" class="m-0 text-xs leading-relaxed text-text-secondary">
      默认使用全局配置，你也可点击加号添加该数据源的处理函数
    </p>
    <div
      v-for="(processor, index) in modelValue"
      :key="processor.id"
      class="mb-2 overflow-hidden rounded border border-solid border-border"
    >
      <div
        class="flex items-center justify-between border-b border-solid border-border bg-layout px-2 py-1"
      >
        <span class="text-xs text-text-secondary">
          {{ getLabel(processor.type) }}
        </span>
        <GrowButton text size="small" type="danger" @click.stop="onRemove(index)">
          <GrowIconify icon="carbon:close" :size="14" />
        </GrowButton>
      </div>
      <div class="h-28">
        <GrowCodeEditor
          v-model="processor.code"
          class="h-full"
          default-language="expression"
          :language-switchable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { nanoid } from 'nanoid'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import { useMsg } from '@grow-admin-rock/components'
import { processorTypeOptions } from './constants'
import type { DesignerApiProcessor, DesignerApiProcessorType } from './types'

defineOptions({ name: 'ApiProcessors' })

const props = defineProps<{
  modelValue: DesignerApiProcessor[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DesignerApiProcessor[]]
}>()

const message = useMsg()

const isTypeAdded = (type: DesignerApiProcessorType) => {
  return props.modelValue.some((item) => item.type === type)
}

const availableOptions = computed(() =>
  processorTypeOptions.filter((option) => !isTypeAdded(option.type)),
)

const getLabel = (type: DesignerApiProcessorType) => {
  return processorTypeOptions.find((option) => option.type === type)?.label || type
}

const onAdd = (type: DesignerApiProcessorType) => {
  if (isTypeAdded(type)) {
    message.warning('该类型处理函数已存在')
    return
  }
  emit('update:modelValue', [...props.modelValue, { id: nanoid(), type, code: '' }])
}

const onRemove = (index: number) => {
  const next = props.modelValue.slice()
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>
