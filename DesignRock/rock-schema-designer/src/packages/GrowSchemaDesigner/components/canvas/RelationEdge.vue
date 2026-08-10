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

    <template v-if="canReconnect">
      <div
        class="schema-edge-endpoint schema-edge-endpoint--source nodrag nopan"
        :class="{ 'is-active': selected || data?.active }"
        :style="{
          transform: `translate(-50%, -50%) translate(${sourceX}px, ${sourceY}px)`,
        }"
        title="拖动以更改起点"
        @mousedown.stop="onSourceEndpointDown"
      />
      <div
        class="schema-edge-endpoint schema-edge-endpoint--target nodrag nopan"
        :class="{ 'is-active': selected || data?.active }"
        :style="{
          transform: `translate(-50%, -50%) translate(${targetX}px, ${targetY}px)`,
        }"
        title="拖动以更改终点"
        @mousedown.stop="onTargetEndpointDown"
      />
    </template>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useHandle,
  useVueFlow,
  type EdgeProps,
  type HandleType,
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

const { emits, findEdge } = useVueFlow()

const canReconnect = computed(() => props.data?.segment === 'direct')

const pathResult = computed(() =>
  getBezierPath({
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

/** 与 Vue Flow EdgeWrapper 一致：固定另一端，拖当前端去改接 */
const updaterNodeId = ref('')
const updaterHandleId = ref<string | null>(null)
const updaterType = ref<HandleType>('source')

const { handlePointerDown } = useHandle({
  nodeId: updaterNodeId,
  handleId: updaterHandleId,
  type: updaterType,
  edgeUpdaterType: updaterType,
  onEdgeUpdate: (event, connection) => {
    const edge = findEdge(props.id)
    if (!edge) return
    emits.edgeUpdate({ event, edge, connection })
  },
  onEdgeUpdateEnd: (event) => {
    const edge = findEdge(props.id)
    if (!edge) return
    emits.edgeUpdateEnd({ event, edge })
  },
})

function onSourceEndpointDown(event: MouseEvent) {
  if (event.button !== 0) return
  const edge = findEdge(props.id)
  if (!edge) return
  // 拖起点：以终点为锚，去寻找新的 source
  updaterNodeId.value = edge.target
  updaterHandleId.value = edge.targetHandle ?? null
  updaterType.value = 'target'
  handlePointerDown(event)
}

function onTargetEndpointDown(event: MouseEvent) {
  if (event.button !== 0) return
  const edge = findEdge(props.id)
  if (!edge) return
  // 拖终点：以起点为锚，去寻找新的 target
  updaterNodeId.value = edge.source
  updaterHandleId.value = edge.sourceHandle ?? null
  updaterType.value = 'source'
  handlePointerDown(event)
}

function onLabelClick() {
  props.data?.onSelect?.(props.data.relationId)
}

function onRemove() {
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
  border: 1px solid color-mix(in srgb, var(--primary-color) 35%, var(--layout-border-color, var(--border-color)));
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--primary-color);
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
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 25%, transparent);
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

.schema-edge-endpoint {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: grab;
  pointer-events: all;
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    transform 0.12s ease;
}

.schema-edge-endpoint:active {
  cursor: grabbing;
}

.schema-edge-endpoint:hover,
.schema-edge-endpoint.is-active {
  border-color: var(--primary-color);
  background: var(--component-background-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 22%, transparent);
}
</style>
