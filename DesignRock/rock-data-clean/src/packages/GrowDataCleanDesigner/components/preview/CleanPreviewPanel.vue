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
      <GrowTable
        v-if="columns.length"
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
      <div v-else class="flex flex-1 items-center justify-center text-xs text-text-secondary">
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

const subtitle = computed(() =>
  props.nodeName ? `当前节点：${props.nodeName}` : '选中节点后展示该节点输出采样',
)

const columns = computed(() => props.result?.columns || [])

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

const emptyHint = computed(() =>
  props.nodeName ? '暂无预览数据（M1 为占位采样，点击顶部「预览」刷新）' : '请选择画布上的节点',
)

function colLabel(col: CleanPreviewColumn) {
  return col.dataType ? `${col.title} · ${col.dataType}` : col.title
}
</script>
