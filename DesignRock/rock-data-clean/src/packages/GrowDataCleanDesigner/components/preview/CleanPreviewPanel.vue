<template>
  <div
    class="clean-preview box-border flex w-full shrink-0 flex-col border-t border-solid border-border bg-component"
    :style="{ height: collapsed ? '40px' : `${height}px` }"
  >
    <div
      class="box-border flex h-10 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
    >
      <div class="flex min-w-0 items-center gap-2">
        <h4 class="m-0 text-[13px] font-semibold text-text">数据预览</h4>
        <span class="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-text-secondary">
          {{ subtitle }}
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <GrowButton text size="small" class="!px-1" :title="collapsed ? '展开' : '折叠'" @click="collapsed = !collapsed">
          <GrowIconify
            :icon="collapsed ? 'carbon:chevron-up' : 'carbon:chevron-down'"
            :size="15"
          />
        </GrowButton>
      </div>
    </div>

    <div v-show="!collapsed" class="box-border flex min-h-0 flex-1 flex-col px-3 py-2">
      <div
        v-if="error"
        class="mb-2 shrink-0 rounded border border-solid px-2.5 py-2 text-xs"
        style="
          color: var(--error-color);
          border-color: color-mix(in srgb, var(--error-color) 35%, var(--layout-border-color));
          background: color-mix(in srgb, var(--error-color) 8%, var(--component-background-color));
        "
      >
        {{ error }}
      </div>
      <div
        v-else-if="warnings.length"
        class="mb-2 max-h-16 shrink-0 overflow-auto rounded border border-solid px-2.5 py-2 text-xs"
        style="
          color: var(--warning-color, #d97706);
          border-color: color-mix(in srgb, var(--warning-color, #d97706) 35%, var(--layout-border-color));
          background: color-mix(in srgb, var(--warning-color, #d97706) 8%, var(--component-background-color));
        "
      >
        <div v-for="(item, index) in warnings" :key="`warn-${index}`">{{ item }}</div>
      </div>

      <GrowTable
        v-if="!error && columns.length"
        :data="tableData"
        border
        size="small"
        height="100%"
        class="h-full min-h-0 flex-1"
      >
        <GrowTableColumn
          v-for="col in columns"
          :key="col.key"
          :prop="col.key"
          :label="colLabel(col)"
          min-width="120"
          show-overflow-tooltip
        />
      </GrowTable>
      <div v-else-if="!error" class="flex flex-1 items-center justify-center text-xs text-text-secondary">
        {{ emptyHint }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CleanPreviewColumn, CleanPreviewResult } from '../../types'

defineOptions({
  name: 'CleanPreviewPanel',
})

const props = withDefaults(
  defineProps<{
    result?: CleanPreviewResult | null
    nodeName?: string | null
    height?: number
  }>(),
  {
    result: null,
    nodeName: null,
    height: 220,
  },
)

const collapsed = ref(false)

const subtitle = computed(() => {
  if (props.result?.targetNodeName) return `当前节点：${props.result.targetNodeName}`
  if (props.nodeName) return `当前节点：${props.nodeName}`
  return '选中节点预览该节点；未选中时预览全流至输出'
})

const columns = computed(() => props.result?.columns || [])
const warnings = computed(() => props.result?.warnings || [])
const error = computed(() => props.result?.error || '')

const tableData = computed(() =>
  (props.result?.rows || []).map((row) => {
    const next: Record<string, string> = {}
    for (const col of columns.value) {
      const value = row[col.key]
      next[col.key] = value == null ? '-' : String(value)
    }
    return next
  }),
)

const emptyHint = computed(() => {
  if (!props.result) return '点击「预览」：有选中则看当前节点，无选中则跑全流至输出'
  if (!(props.result.columns || []).length) return '暂无输出列'
  return '暂无数据行'
})

function colLabel(col: CleanPreviewColumn) {
  return col.dataType ? `${col.title} · ${col.dataType}` : col.title
}
</script>
