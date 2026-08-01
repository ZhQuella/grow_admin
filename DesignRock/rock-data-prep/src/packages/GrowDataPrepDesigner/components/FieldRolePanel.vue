<template>
  <div class="box-border flex h-full min-h-0 flex-col px-3 py-3">
    <p class="m-0 mb-3 text-xs text-text-secondary">
      点击画布表节点切换来源，再将字段设为维度 / 度量。多表关联请在「表关联」中手动配置。
    </p>

    <div class="mb-2 text-xs font-medium text-text">可用字段</div>
    <div class="mb-3 max-h-[200px] overflow-auto rounded border border-solid border-border">
      <div
        v-for="col in columns"
        :key="col.id"
        class="flex items-center justify-between gap-2 border-b border-solid border-border px-2 py-1.5 last:border-b-0"
      >
        <div class="min-w-0">
          <div class="truncate text-xs text-text">{{ col.name }}</div>
          <div class="text-[11px] text-text-secondary">{{ col.type }}</div>
        </div>
        <div class="flex shrink-0 gap-1">
          <GrowButton size="small" @click="emit('add-dimension', col.id)">维度</GrowButton>
          <GrowButton size="small" type="primary" @click="emit('add-measure', col.id)">
            度量
          </GrowButton>
        </div>
      </div>
      <div v-if="!columns.length" class="px-2 py-6 text-center text-xs text-text-secondary">
        请先在画布添加表
      </div>
    </div>

    <div class="mb-2 text-xs font-medium text-text">维度</div>
    <div class="mb-3 flex flex-col gap-1.5">
      <div
        v-for="item in dimensions"
        :key="item.id"
        class="flex items-center gap-2 rounded border border-solid border-border px-2 py-1.5"
      >
        <GrowInput
          :model-value="item.name"
          size="small"
          class="min-w-0 flex-1"
          @update:model-value="(v) => emit('update-dimension', item.id, { name: String(v ?? '') })"
        />
        <span class="shrink-0 text-[11px] text-text-secondary">{{ item.field }}</span>
        <GrowButton text size="small" @click="emit('remove-dimension', item.id)">
          <GrowIconify icon="carbon:close" :size="14" />
        </GrowButton>
      </div>
      <div v-if="!dimensions.length" class="text-xs text-text-secondary">暂无维度</div>
    </div>

    <div class="mb-2 text-xs font-medium text-text">度量</div>
    <div class="flex flex-col gap-1.5">
      <div
        v-for="item in measures"
        :key="item.id"
        class="flex flex-col gap-1.5 rounded border border-solid border-border px-2 py-1.5"
      >
        <div class="flex items-center gap-2">
          <GrowInput
            :model-value="item.name"
            size="small"
            class="min-w-0 flex-1"
            @update:model-value="(v) => emit('update-measure', item.id, { name: String(v ?? '') })"
          />
          <GrowButton text size="small" @click="emit('remove-measure', item.id)">
            <GrowIconify icon="carbon:close" :size="14" />
          </GrowButton>
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-[11px] text-text-secondary">{{ item.field }}</span>
          <GrowSelect
            :model-value="item.agg"
            :options="DATA_PREP_AGG_OPTIONS"
            size="small"
            class="min-w-0 flex-1"
            @update:model-value="(v) => emit('update-measure', item.id, { agg: v as DataPrepAgg })"
          />
        </div>
      </div>
      <div v-if="!measures.length" class="text-xs text-text-secondary">暂无度量</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATA_PREP_AGG_OPTIONS } from '../factories'
import type {
  DataPrepAgg,
  DataPrepDimension,
  DataPrepMeasure,
  DataPrepSchemaColumn,
} from '../types'

defineOptions({
  name: 'DataPrepFieldRolePanel',
})

defineProps<{
  columns: DataPrepSchemaColumn[]
  dimensions: DataPrepDimension[]
  measures: DataPrepMeasure[]
}>()

const emit = defineEmits<{
  'add-dimension': [columnId: string]
  'add-measure': [columnId: string]
  'remove-dimension': [id: string]
  'remove-measure': [id: string]
  'update-dimension': [id: string, patch: Partial<DataPrepDimension>]
  'update-measure': [id: string, patch: Partial<DataPrepMeasure>]
}>()
</script>
