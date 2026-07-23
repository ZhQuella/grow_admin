<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0 px-3 pt-3">
      <GrowForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-width="120px"
        label-position="left"
        size="small"
      >
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="model.name" placeholder="挂到 state.名称" clearable />
        </GrowFormItem>
        <GrowFormItem label="描述" prop="description">
          <GrowInput
            v-model="model.description"
            type="textarea"
            :rows="2"
            placeholder="请输入"
          />
        </GrowFormItem>
      </GrowForm>
    </div>

    <div
      class="flex h-8 shrink-0 items-center border-y border-solid border-border bg-layout px-3 text-sm font-medium text-text"
    >
      计算表达式
    </div>

    <p class="shrink-0 px-3 py-2 text-xs leading-relaxed text-text-secondary">
      写法与 JS 表达式一致，可使用
      <code class="rounded bg-layout px-1">state</code>
      引用数据源及其它计算属性（按列表顺序求值）。
    </p>

    <div
      class="relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded border border-solid border-border"
    >
      <GrowCodeEditor
        v-model="model.code"
        class="h-full"
        default-language="expression"
        :language-switchable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import { driverRef } from '@grow-admin-rock/components'
import type { DesignerComputedPropFormModel } from './types'

defineOptions({ name: 'ComputedPropForm' })

defineProps<{
  model: DesignerComputedPropFormModel
  rules: Record<string, any>
}>()

const formRef = ref()

defineExpose({
  validate: () => driverRef(formRef)?.validate(),
})
</script>
