<template>
  <div class="box-border flex h-[80vh] flex-col gap-3 p-4">
    <div class="shrink-0">
      <h1 class="m-0 mb-1 text-lg font-semibold text-text">代码编辑器</h1>
      <p class="m-0 text-sm text-text-secondary">
        演示 GrowCodeEditor 多语言切换（JavaScript / HTML / CSS / JSON / Vue 3 / SQL）
      </p>
    </div>

    <div class="flex shrink-0 flex-wrap items-center gap-3 text-sm text-text-secondary">
      <span>当前语言：<strong class="text-text">{{ currentLanguageLabel }}</strong></span>
      <span v-if="lastSwitchTip">{{ lastSwitchTip }}</span>
    </div>

    <GrowCodeEditor
      ref="editorRef"
      v-model="code"
      class="min-h-0 flex-1 overflow-hidden rounded border border-solid border-border bg-component"
      default-language="javascript"
      :language-switchable="true"
      :options="{ theme: 'auto' }"
      @before-language-change="onBeforeLanguageChange"
      @after-language-change="onAfterLanguageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type {
  CodeEditorBeforeLanguageChangePayload,
  CodeEditorLanguage,
  CodeEditorLanguageChangePayload,
} from '@grow-admin-rock/code-sandbox'
import {
  CODE_EDITOR_LANGUAGE_OPTIONS,
  GrowCodeEditor,
} from '@grow-admin-rock/code-sandbox'

defineOptions({
  name: 'CodeEditorDemoPage',
})

const SAMPLE_BY_LANGUAGE: Record<CodeEditorLanguage, string> = {
  javascript: `function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('Grow'))
`,
  html: `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Grow Demo</title>
  </head>
  <body>
    <h1>Hello Grow</h1>
  </body>
</html>
`,
  css: `.card {
  padding: 16px;
  border-radius: 8px;
  background: #f7f7fa;
  color: #333;
}
`,
  json: `{
  "name": "grow-admin",
  "version": "1.0.0",
  "private": true
}
`,
  vue: `<template>
  <div class="demo">{{ message }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello Vue 3')
<\/script>

<style scoped>
.demo {
  padding: 12px;
}
</style>
`,
  sql: `SELECT id, name, created_at
FROM users
WHERE status = 1
ORDER BY id DESC
LIMIT 20;
`,
}

const editorRef = ref<InstanceType<typeof GrowCodeEditor> | null>(null)
const code = ref(SAMPLE_BY_LANGUAGE.javascript)
const currentLanguage = ref<CodeEditorLanguage>('javascript')
const lastSwitchTip = ref('')

const currentLanguageLabel = computed(() => {
  const hit = CODE_EDITOR_LANGUAGE_OPTIONS.find(
    (item) => item.value === currentLanguage.value,
  )
  return hit?.label ?? currentLanguage.value
})

function onBeforeLanguageChange(_payload: CodeEditorBeforeLanguageChangePayload) {
  // 演示页允许自由切换；业务侧可在此 preventDefault()
}

function onAfterLanguageChange(payload: CodeEditorLanguageChangePayload) {
  currentLanguage.value = payload.to
  // 演示：切换语言时替换为对应示例代码（正式业务可自行决定是否保留原文）
  code.value = SAMPLE_BY_LANGUAGE[payload.to] ?? ''
  lastSwitchTip.value = `已从 ${payload.from} 切换到 ${payload.to}`
}
</script>
