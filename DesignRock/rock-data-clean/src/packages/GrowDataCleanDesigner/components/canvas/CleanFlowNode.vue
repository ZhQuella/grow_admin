<template>
  <div
    class="clean-flow-node"
    :class="[`is-${category}`, { 'is-selected': selected }]"
    @click.stop="$emit('select', id)"
  >
    <!-- 输入只在左侧（上中下），避免与输出锚点混在同侧导致拖拽箭头反向 -->
    <template v-if="inputs >= 1">
      <Handle
        id="in-left"
        type="target"
        :position="Position.Left"
        class="clean-handle"
        :style="inputs >= 2 ? { top: '50%' } : undefined"
      />
      <Handle
        v-if="inputs >= 2"
        id="in-left-top"
        type="target"
        :position="Position.Left"
        class="clean-handle"
        style="top: 28%"
      />
      <Handle
        v-if="inputs >= 2"
        id="in-left-bottom"
        type="target"
        :position="Position.Left"
        class="clean-handle"
        style="top: 72%"
      />
    </template>

    <div class="clean-flow-node__head">
      <div class="clean-flow-node__head-main">
        <GrowIconify :icon="icon" :size="14" class="clean-flow-node__icon" />
        <span class="clean-flow-node__title" :title="name">{{ name }}</span>
      </div>
      <span class="clean-flow-node__tag">{{ categoryLabel }}</span>
    </div>
    <div class="clean-flow-node__body">
      <div class="clean-flow-node__type">{{ typeLabel }}</div>
      <div class="clean-flow-node__stats">{{ statsText }}</div>
      <div v-if="inputs >= 1 || outputs >= 1" class="clean-flow-node__ports-tip">
        <span v-if="inputs >= 1">左入</span>
        <span v-if="inputs >= 1 && outputs >= 1"> · </span>
        <span v-if="outputs >= 2">右出(是/否)</span>
        <span v-else-if="outputs >= 1">右出</span>
      </div>
    </div>

    <!-- 条件分支：右侧上下两个出口 -->
    <template v-if="outputs >= 2">
      <Handle
        id="out-true"
        type="source"
        :position="Position.Right"
        class="clean-handle"
        style="top: 32%"
      />
      <Handle
        id="out-false"
        type="source"
        :position="Position.Right"
        class="clean-handle"
        style="top: 68%"
      />
      <div class="clean-flow-node__branch-hint clean-flow-node__branch-hint--true">是</div>
      <div class="clean-flow-node__branch-hint clean-flow-node__branch-hint--false">否</div>
    </template>

    <!-- 普通节点：右侧可一路分发 -->
    <template v-else-if="outputs >= 1">
      <Handle id="out-right" type="source" :position="Position.Right" class="clean-handle" />
      <Handle
        id="out-right-top"
        type="source"
        :position="Position.Right"
        class="clean-handle"
        style="top: 28%"
      />
      <Handle
        id="out-right-bottom"
        type="source"
        :position="Position.Right"
        class="clean-handle"
        style="top: 72%"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { CATEGORY_META, NODE_TYPE_META } from '../../static/nodeCatalog'
import type { CleanNodeType } from '../../types'

defineOptions({
  name: 'CleanFlowNode',
})

const props = defineProps<{
  id: string
  selected?: boolean
  name: string
  nodeType: CleanNodeType
  inputRows?: number | null
  outputRows?: number | null
}>()

defineEmits<{
  select: [id: string]
}>()

const meta = computed(() => NODE_TYPE_META[props.nodeType])
const category = computed(() => meta.value.category)
const categoryLabel = computed(() => CATEGORY_META[category.value].label)
const typeLabel = computed(() => meta.value.label)
const icon = computed(() => meta.value.icon)
const inputs = computed(() => meta.value.inputs)
const outputs = computed(() => meta.value.outputs)

const statsText = computed(() => {
  const inn = props.inputRows
  const out = props.outputRows
  if (inn == null && out == null) return '未预览'
  const a = inn == null ? '-' : `${inn} 行`
  const b = out == null ? '-' : `${out} 行`
  return `${a} → ${b}`
})
</script>

<style scoped>
.clean-flow-node {
  box-sizing: border-box;
  position: relative;
  width: 200px;
  min-height: 84px;
  border-radius: 8px;
  border: 1.5px solid var(--clean-node-border, var(--layout-border-color));
  background: var(--clean-node-bg, var(--component-background-color));
  color: var(--text-color);
  box-shadow: none;
  cursor: pointer;
  user-select: none;
  transition: border-width 0.12s ease, opacity 0.12s ease, background 0.12s ease;
}

.clean-flow-node.is-source {
  --clean-node-border: var(--clean-cat-source);
  --clean-node-bg: color-mix(in srgb, var(--clean-cat-source) 12%, var(--component-background-color));
}
.clean-flow-node.is-clean {
  --clean-node-border: var(--clean-cat-clean);
  --clean-node-bg: color-mix(in srgb, var(--clean-cat-clean) 12%, var(--component-background-color));
}
.clean-flow-node.is-merge {
  --clean-node-border: var(--clean-cat-merge);
  --clean-node-bg: color-mix(in srgb, var(--clean-cat-merge) 12%, var(--component-background-color));
}
.clean-flow-node.is-agg {
  --clean-node-border: var(--clean-cat-agg);
  --clean-node-bg: color-mix(in srgb, var(--clean-cat-agg) 12%, var(--component-background-color));
}
.clean-flow-node.is-output {
  --clean-node-border: var(--clean-cat-output);
  --clean-node-bg: color-mix(in srgb, var(--clean-cat-output) 12%, var(--component-background-color));
}

.clean-flow-node:hover {
  border-width: 2px;
}

.clean-flow-node.is-selected {
  border-width: 2px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--clean-node-border) 28%, transparent);
}

.clean-flow-node__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 4px;
}

.clean-flow-node__head-main {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
}

.clean-flow-node__icon {
  color: var(--clean-node-border);
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
}

.clean-flow-node__head-main :deep(.grow-iconify) {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
}

.clean-flow-node__head-main :deep(.grow-iconify svg) {
  width: 14px;
  height: 14px;
}

.clean-flow-node__title {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  text-align: left;
}

.clean-flow-node__tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--clean-node-border);
}

.clean-flow-node__body {
  padding: 0 10px 10px;
}

.clean-flow-node__type {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.clean-flow-node__stats {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.clean-flow-node__ports-tip {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-color-secondary);
  opacity: 0.85;
}

.clean-flow-node__branch-hint {
  position: absolute;
  right: -18px;
  z-index: 1;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--clean-node-border);
  pointer-events: none;
}

.clean-flow-node__branch-hint--true {
  top: calc(32% - 5px);
}

.clean-flow-node__branch-hint--false {
  top: calc(68% - 5px);
}

.clean-handle {
  width: 11px !important;
  height: 11px !important;
  border: 2px solid var(--clean-node-border) !important;
  background: var(--component-background-color) !important;
}

.clean-handle:hover {
  width: 13px !important;
  height: 13px !important;
  background: var(--clean-node-border) !important;
}
</style>
