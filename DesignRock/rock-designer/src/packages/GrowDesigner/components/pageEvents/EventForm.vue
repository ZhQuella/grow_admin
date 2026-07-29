<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0 px-3 pt-3">
      <GrowForm
        label-width="100px"
        label-position="left"
        size="small"
        :show-message="false"
      >
        <GrowFormItem label="函数名">
          <GrowInput
            v-model="model.name"
            clearable
            placeholder="如 onMounted"
          />
        </GrowFormItem>
        <GrowFormItem label="启用绑定">
          <div class="flex items-center gap-2">
            <GrowSwitch v-model="model.enabled" size="small" />
            <span class="text-xs text-text-secondary">开启后预览/运行时会绑定并执行该事件</span>
          </div>
        </GrowFormItem>
        <GrowFormItem label="事件类型">
          <span
            class="text-sm text-text-secondary"
            style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          >
            {{ model.eventType }}
          </span>
        </GrowFormItem>
      </GrowForm>
    </div>

    <div
      class="flex h-8 shrink-0 items-center justify-between border-y border-solid border-border bg-layout px-3 text-sm font-medium text-text"
    >
      <span>函数体</span>
      <span class="text-xs font-normal text-text-secondary">参数：event、state</span>
    </div>

    <div
      class="relative mx-3 mt-2 min-h-0 flex-1 overflow-hidden rounded border border-solid border-border"
    >
      <GrowCodeEditor
        v-model="model.code"
        class="h-full"
        default-language="javascript"
        :language-switchable="false"
      />
    </div>

    <pre
      class="mx-3 mb-3 mt-2 max-h-16 shrink-0 overflow-auto rounded bg-layout px-2.5 py-2 text-xs leading-relaxed text-text-secondary"
    >{{ EXAMPLE_CODE }}</pre>
  </div>
</template>

<script setup lang="ts">
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import type { DesignerEventItem } from '../../static/elementEvents/types'

defineOptions({ name: 'PageEventForm' })

defineProps<{
  model: DesignerEventItem
}>()

const EXAMPLE_CODE = `// 函数体示例
console.log('event', event)
console.log('state', state)
// state.user.name = 'Bob'`
</script>
