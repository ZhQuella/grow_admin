<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0 px-3 pt-3">
      <GrowForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-width="48px"
        label-position="left"
        size="small"
      >
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="model.name" placeholder="请输入" clearable />
        </GrowFormItem>
        <GrowFormItem label="描述" prop="description">
          <GrowInput v-model="model.description" placeholder="请输入" clearable />
        </GrowFormItem>
      </GrowForm>
    </div>

    <div
      class="flex h-8 shrink-0 items-center border-y border-solid border-border bg-layout px-3 text-sm font-medium text-text"
    >
      数据
    </div>

    <p class="shrink-0 px-3 py-2 text-xs leading-relaxed text-text-secondary">
      输入框内默认支持变量，写法和 JS 写法完全一致。
      <DataExamplePopover />
    </p>

    <div
      class="relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded border border-solid border-border"
    >
      <GrowCodeEditor
        v-model="model.data"
        class="h-full"
        default-language="javascript"
        :language-switchable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import { driverRef } from '@grow-admin-rock/components'
import DataExamplePopover from '../shared/DataExamplePopover.vue'
import type { DesignerDataSourceFormModel } from './types'

defineOptions({ name: 'DataSourceForm' })

defineProps<{
  model: DesignerDataSourceFormModel
  rules: Record<string, any>
}>()

const formRef = ref()

defineExpose({
  validate: () => driverRef(formRef)?.validate(),
})
</script>
