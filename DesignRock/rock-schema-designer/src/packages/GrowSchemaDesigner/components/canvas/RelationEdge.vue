<template>
  <BaseEdge
    :id="id"
    :path="edgePath"
    :marker-end="markerEnd"
    :style="style"
    :interaction-width="interactionWidth"
  />
  <EdgeLabelRenderer>
    <div
      class="schema-edge-label nodrag nopan"
      :class="{ 'is-active': selected || data?.active }"
      :style="{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
      }"
      @click.stop="onLabelClick"
    >
      <span class="schema-edge-label__text">{{ data?.label || label }}</span>
      <GrowButton
        text
        size="small"
        class="schema-edge-label__delete"
        title="删除关联"
        @click.stop="onRemove"
        @mousedown.stop
      >
        <GrowIconify icon="carbon:trash-can" :size="12" />
      </GrowButton>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Position,
} from '@vue-flow/core'
import type { FlowEdgeData } from '../../utils/flowMapper'

defineOptions({
  name: 'SchemaRelationEdge',
})

const props = defineProps<
  EdgeProps<FlowEdgeData> & {
    sourcePosition: Position
    targetPosition: Position
    interactionWidth?: number
  }
>()

const pathResult = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  }),
)

const edgePath = computed(() => pathResult.value[0])
const labelX = computed(() => pathResult.value[1])
const labelY = computed(() => pathResult.value[2])

const onLabelClick = () => {
  props.data?.onSelect?.(props.data.relationId)
}

const onRemove = () => {
  if (!props.data?.relationId) return
  props.data.onRemove?.(props.data.relationId)
}
</script>

<style scoped>
.schema-edge-label {
  position: absolute;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 2px 1px 6px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--text-color-secondary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  pointer-events: all;
  cursor: pointer;
  box-shadow: var(--card-shadow);
  user-select: none;
}

.schema-edge-label.is-active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.schema-edge-label__text {
  padding-right: 2px;
}

.schema-edge-label__delete {
  display: none !important;
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  padding: 0 !important;
  margin: 0 !important;
  align-items: center;
  justify-content: center;
  border-radius: 3px !important;
  color: inherit !important;
  line-height: 0 !important;
}

.schema-edge-label:hover .schema-edge-label__delete,
.schema-edge-label.is-active .schema-edge-label__delete {
  display: inline-flex !important;
}

.schema-edge-label__delete:hover {
  background: rgba(237, 111, 111, 0.45) !important;
  color: #fff !important;
}

.schema-edge-label__delete :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  line-height: 0;
  color: inherit;
}

.schema-edge-label__delete :deep(.grow-iconify svg) {
  display: block;
  width: 12px;
  height: 12px;
}
</style>
