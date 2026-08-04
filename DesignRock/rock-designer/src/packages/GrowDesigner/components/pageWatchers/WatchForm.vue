<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0 px-3 pt-3">
      <GrowForm
        label-width="100px"
        label-position="left"
        size="small"
        :show-message="false"
      >
        <GrowFormItem label="监听路径">
          <GrowInput
            v-model="model.source"
            clearable
            placeholder="如 state.user 或 state.user.name"
          />
        </GrowFormItem>
        <GrowFormItem label="启用绑定">
          <div class="flex items-center gap-2">
            <GrowSwitch v-model="model.enabled" size="small" />
            <span class="text-xs text-text-secondary">开启后预览会监听该路径变化</span>
          </div>
        </GrowFormItem>
        <GrowFormItem label="深度监听">
          <div class="flex items-center gap-2">
            <GrowSwitch v-model="model.deep" size="small" />
            <span class="text-xs text-text-secondary">对象/数组内部变化也触发</span>
          </div>
        </GrowFormItem>
        <GrowFormItem label="立即执行">
          <div class="flex items-center gap-2">
            <GrowSwitch v-model="model.immediate" size="small" />
            <span class="text-xs text-text-secondary">挂载时先用当前值执行一次</span>
          </div>
        </GrowFormItem>
      </GrowForm>
    </div>

    <div
      class="flex h-8 shrink-0 items-center justify-between border-y border-solid border-border bg-layout px-3 text-sm font-medium text-text"
    >
      <span>函数体</span>
      <span class="text-xs font-normal text-text-secondary">参数：value、oldValue、state、refs</span>
    </div>

    <div
      class="relative mx-3 mt-2 min-h-0 flex-1 overflow-hidden rounded border border-solid border-border"
    >
      <GrowCodeEditor
        v-model="model.code"
        class="h-full"
        default-language="javascript"
        :language-switchable="false"
        :globals="CODE_EDITOR_WATCH_GLOBALS"
      />
    </div>

    <pre
      class="mx-3 mb-3 mt-2 max-h-16 shrink-0 overflow-auto rounded bg-layout px-2.5 py-2 text-xs leading-relaxed text-text-secondary"
    >{{ EXAMPLE_CODE }}</pre>
  </div>
</template>

<script setup lang="ts">
import { GrowCodeEditor, CODE_EDITOR_WATCH_GLOBALS } from '@grow-admin-rock/code-sandbox'
import type { DesignerWatcherItem } from '../../static/pageWatchers'

defineOptions({ name: 'WatchForm' })

defineProps<{
  model: Omit<DesignerWatcherItem, 'name'>
}>()

const EXAMPLE_CODE = `// 函数体示例
console.log('value', value)
console.log('oldValue', oldValue)
console.log('state', state)
// refs.form?.validate?.()`
</script>
