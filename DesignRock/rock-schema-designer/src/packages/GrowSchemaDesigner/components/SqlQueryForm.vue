<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="shrink-0 px-3 pt-3">
      <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
        <GrowFormItem label="名称">
          <GrowInput v-model="model.name" clearable placeholder="查询名称" />
        </GrowFormItem>
        <GrowFormItem label="说明">
          <GrowInput
            v-model="model.description"
            clearable
            type="textarea"
            :rows="2"
            placeholder="可选说明"
          />
        </GrowFormItem>
      </GrowForm>
    </div>

    <div
      class="flex h-8 shrink-0 items-center justify-between border-y border-solid border-border bg-layout px-3 text-sm font-medium text-text"
    >
      <span>SQL</span>
      <span class="text-xs font-normal text-text-secondary">执行库：{{ databaseName || '未命名' }}</span>
    </div>

    <div
      class="relative mx-3 mb-3 mt-2 min-h-0 flex-1 overflow-hidden rounded border border-solid border-border"
    >
      <GrowCodeEditor
        v-model="model.sql"
        class="h-full"
        default-language="sql"
        :language-switchable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import type { SchemaSqlQuery } from '../types'

defineOptions({ name: 'SqlQueryForm' })

defineProps<{
  model: Pick<SchemaSqlQuery, 'name' | 'description' | 'sql'>
  databaseName: string
}>()
</script>
