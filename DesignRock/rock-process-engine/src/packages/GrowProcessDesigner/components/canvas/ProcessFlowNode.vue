<template>
  <div
    class="process-flow-node"
    :class="[
      `is-${category}`,
      {
        'is-selected': selected,
        'has-multi-out': branchOutputs.length >= 2,
      },
    ]"
    :style="nodeWidthStyle"
    @click.stop="$emit('select', id)"
  >
    <template v-if="inputs >= 1">
      <Handle
        id="in-top"
        type="target"
        :position="Position.Top"
        class="process-handle"
      />
    </template>

    <div class="process-flow-node__head">
      <div class="process-flow-node__head-main">
        <GrowIconify :icon="icon" :size="14" class="process-flow-node__icon" />
        <span class="process-flow-node__title" :title="name">{{ name }}</span>
      </div>
      <span class="process-flow-node__tag">{{ categoryShort }}</span>
    </div>
    <div class="process-flow-node__body">
      <div class="process-flow-node__type">{{ typeLabel }}</div>
      <div class="process-flow-node__ports-tip">
        <span v-if="inputs < 1">无入口</span>
        <span v-else>上入</span>
        <span> · </span>
        <span v-if="outputs < 1 && !branchOutputs.length">无出口</span>
        <span v-else-if="branchOutputs.length">下出({{ branchOutputs.length }}路)</span>
        <span v-else>下出</span>
      </div>
    </div>

    <!-- 条件 / 并行：动态多出口 -->
    <template v-if="branchOutputs.length">
      <Handle
        v-for="(arm, index) in branchOutputs"
        :id="branchHandleId(arm.id)"
        :key="arm.id"
        type="source"
        :position="Position.Bottom"
        class="process-handle"
        :style="{ left: `${branchHandleLeftPercent(index, branchOutputs.length)}%` }"
      />
      <div
        v-for="(arm, index) in branchOutputs"
        :key="`hint-${arm.id}`"
        class="process-flow-node__branch-hint"
        :class="{ 'is-default': !!arm.isDefault }"
        :style="{ left: `${branchHandleLeftPercent(index, branchOutputs.length)}%` }"
        :title="arm.label"
      >
        {{ arm.label }}
      </div>
    </template>

    <template v-else-if="outputs >= 1">
      <Handle id="out-bottom" type="source" :position="Position.Bottom" class="process-handle" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { CATEGORY_META, NODE_TYPE_META } from '../../static/nodeCatalog'
import { branchHandleId, branchHandleLeftPercent } from '../../utils/branches'
import type { ProcessNodeType } from '../../types'

defineOptions({
  name: 'ProcessFlowNode',
})

const props = defineProps<{
  id: string
  selected?: boolean
  name: string
  nodeType: ProcessNodeType
  /** 条件分支 / 并行分支动态出口 */
  branchOutputs?: Array<{ id: string; label: string; isDefault?: boolean }>
}>()

defineEmits<{
  select: [id: string]
}>()

const { updateNodeInternals } = useVueFlow()

const meta = computed(() => NODE_TYPE_META[props.nodeType])
const category = computed(() => meta.value.category)
const categoryShort = computed(() => {
  const label = CATEGORY_META[category.value].label
  return label.replace(/流$/, '')
})
const typeLabel = computed(() => meta.value.label)
const icon = computed(() => meta.value.icon)
const inputs = computed(() => meta.value.inputs)
const outputs = computed(() => meta.value.outputs)
const branchOutputs = computed(() => props.branchOutputs || [])
const nodeWidthStyle = computed(() => {
  const count = branchOutputs.value.length
  if (count <= 2) return undefined
  return { width: `${Math.min(440, Math.max(200, count * 40))}px` }
})

watch(
  () => branchOutputs.value.map((item) => item.id).join('|'),
  async () => {
    await nextTick()
    updateNodeInternals(props.id)
  },
)
</script>

<style scoped>
.process-flow-node {
  box-sizing: border-box;
  position: relative;
  width: 200px;
  min-height: 78px;
  border-radius: 8px;
  border: 1.5px solid var(--process-node-border, var(--layout-border-color));
  background: var(--process-node-bg, var(--component-background-color));
  color: var(--text-color);
  cursor: pointer;
  user-select: none;
  transition: border-width 0.12s ease, background 0.12s ease;
}

.process-flow-node.has-multi-out {
  margin-bottom: 14px;
}

.process-flow-node.is-human {
  --process-node-border: var(--process-cat-human);
  --process-node-bg: color-mix(in srgb, var(--process-cat-human) 12%, var(--component-background-color));
}
.process-flow-node.is-event {
  --process-node-border: var(--process-cat-event);
  --process-node-bg: color-mix(in srgb, var(--process-cat-event) 12%, var(--component-background-color));
}
.process-flow-node.is-system {
  --process-node-border: var(--process-cat-system);
  --process-node-bg: color-mix(in srgb, var(--process-cat-system) 12%, var(--component-background-color));
}
.process-flow-node.is-state {
  --process-node-border: var(--process-cat-state);
  --process-node-bg: color-mix(in srgb, var(--process-cat-state) 12%, var(--component-background-color));
}
.process-flow-node.is-decision {
  --process-node-border: var(--process-cat-decision);
  --process-node-bg: color-mix(in srgb, var(--process-cat-decision) 12%, var(--component-background-color));
}
.process-flow-node.is-branch {
  --process-node-border: var(--process-cat-branch);
  --process-node-bg: color-mix(in srgb, var(--process-cat-branch) 12%, var(--component-background-color));
}

.process-flow-node:hover {
  border-width: 2px;
}

.process-flow-node.is-selected {
  border-width: 2px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--process-node-border) 28%, transparent);
}

.process-flow-node__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 4px;
}

.process-flow-node__head-main {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
}

.process-flow-node__icon {
  color: var(--process-node-border);
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
}

.process-flow-node__head-main :deep(.grow-iconify) {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
}

.process-flow-node__head-main :deep(.grow-iconify svg) {
  width: 14px;
  height: 14px;
}

.process-flow-node__title {
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

.process-flow-node__tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--process-node-border);
}

.process-flow-node__body {
  padding: 0 10px 10px;
}

.process-flow-node__type {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.process-flow-node__ports-tip {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-color-secondary);
  opacity: 0.85;
}

.process-flow-node__branch-hint {
  position: absolute;
  bottom: -14px;
  z-index: 1;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--process-node-border);
  pointer-events: none;
  transform: translateX(-50%);
}

.process-flow-node__branch-hint.is-default {
  opacity: 0.75;
  font-weight: 600;
}

.process-handle {
  width: 11px !important;
  height: 11px !important;
  border: 2px solid var(--process-node-border) !important;
  background: var(--component-background-color) !important;
  z-index: 5 !important;
}

.process-handle:hover {
  width: 13px !important;
  height: 13px !important;
  background: var(--process-node-border) !important;
}
</style>
