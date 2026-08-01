<template>
  <div class="box-border flex flex-col px-3 py-3">
    <p class="m-0 mb-3 text-xs text-text-secondary">
      点击画布表节点切换来源，再将字段设为维度 / 度量。多表关联请在「表关联」中手动配置。
    </p>

    <div class="mb-2 text-xs font-medium text-text">可用字段</div>
    <div class="mb-3 rounded border border-solid border-border">
      <div
        v-for="col in columns"
        :key="col.id"
        class="flex items-center justify-between gap-2 border-b border-solid border-border px-2 py-1.5 last:border-b-0"
        :class="{
          'is-dim-row': isDimension(col.name) && !isMeasure(col.name),
          'is-mea-row': isMeasure(col.name) && !isDimension(col.name),
          'is-both-row': isDimension(col.name) && isMeasure(col.name),
        }"
      >
        <div class="min-w-0">
          <div class="truncate text-xs text-text">{{ col.name }}</div>
          <div class="text-[11px] text-text-secondary">{{ col.type }}</div>
        </div>
        <div class="flex shrink-0 gap-1">
          <button
            type="button"
            class="field-role-btn dim"
            :class="{ 'is-active': isDimension(col.name) }"
            @click="emit('add-dimension', col.id)"
          >
            维度
          </button>
          <button
            type="button"
            class="field-role-btn mea"
            :class="{ 'is-active': isMeasure(col.name) }"
            @click="emit('add-measure', col.id)"
          >
            度量
          </button>
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
    <div class="flex flex-col gap-2">
      <div
        v-for="item in measures"
        :key="item.id"
        class="flex flex-col gap-2 rounded border border-solid border-border px-2.5 py-2"
      >
        <div class="flex items-center gap-1.5">
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
        <div class="truncate font-mono text-[11px] leading-none text-text-secondary">
          {{ item.field }}
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-[11px] text-text-secondary">输出 key</span>
          <GrowInput
            :model-value="item.outputKey || ''"
            size="small"
            class="min-w-0 flex-1"
            placeholder="结果对象字段名"
            @update:model-value="
              (v) => emit('update-measure', item.id, { outputKey: String(v ?? '').trim() })
            "
          />
        </div>
        <GrowSelect
          :model-value="item.agg"
          :options="DATA_PREP_AGG_OPTIONS"
          size="small"
          class="w-full"
          @update:model-value="(v) => emit('update-measure', item.id, { agg: v as DataPrepAgg })"
        />
        <p
          v-if="getDataPrepAggDescription(item.agg)"
          class="m-0 text-[11px] leading-relaxed text-text-secondary"
        >
          {{ getDataPrepAggDescription(item.agg) }}
        </p>
      </div>
      <div v-if="!measures.length" class="text-xs text-text-secondary">暂无度量</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DATA_PREP_AGG_OPTIONS,
  fieldKey,
  getDataPrepAggDescription,
} from '../factories'
import type {
  DataPrepAgg,
  DataPrepDimension,
  DataPrepMeasure,
  DataPrepSchemaColumn,
} from '../types'

defineOptions({
  name: 'DataPrepFieldRolePanel',
})

const props = defineProps<{
  columns: DataPrepSchemaColumn[]
  dimensions: DataPrepDimension[]
  measures: DataPrepMeasure[]
  /** 当前来源表 alias，用于匹配已选 field */
  sourceAlias?: string
}>()

const emit = defineEmits<{
  'add-dimension': [columnId: string]
  'add-measure': [columnId: string]
  'remove-dimension': [id: string]
  'remove-measure': [id: string]
  'update-dimension': [id: string, patch: Partial<DataPrepDimension>]
  'update-measure': [id: string, patch: Partial<DataPrepMeasure>]
}>()

const dimensionFields = computed(() => new Set(props.dimensions.map((d) => d.field)))
const measureFields = computed(() => new Set(props.measures.map((m) => m.field)))

const fieldOf = (columnName: string) =>
  props.sourceAlias ? fieldKey(props.sourceAlias, columnName) : columnName

const isDimension = (columnName: string) => dimensionFields.value.has(fieldOf(columnName))
const isMeasure = (columnName: string) => measureFields.value.has(fieldOf(columnName))
</script>

<style scoped>
.is-dim-row {
  background: color-mix(in srgb, #3b82f6 8%, transparent);
}

.is-mea-row {
  background: color-mix(in srgb, #16a34a 8%, transparent);
}

.is-both-row {
  background: color-mix(in srgb, #3b82f6 7%, color-mix(in srgb, #16a34a 7%, transparent));
}

.field-role-btn {
  box-sizing: border-box;
  display: inline-flex;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--layout-border-color, var(--border-color)) 80%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--layout-background-color, #f5f5f5) 70%, transparent);
  color: var(--text-color-secondary, var(--text-secondary-color, #8c8c8c));
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.field-role-btn:hover {
  color: var(--text-color);
  border-color: var(--layout-border-color, var(--border-color));
}

.field-role-btn.dim.is-active {
  color: #1d4ed8;
  background: color-mix(in srgb, #3b82f6 22%, transparent);
  border-color: color-mix(in srgb, #3b82f6 50%, transparent);
  font-weight: 600;
}

.field-role-btn.mea.is-active {
  color: #15803d;
  background: color-mix(in srgb, #16a34a 22%, transparent);
  border-color: color-mix(in srgb, #16a34a 50%, transparent);
  font-weight: 600;
}
</style>
