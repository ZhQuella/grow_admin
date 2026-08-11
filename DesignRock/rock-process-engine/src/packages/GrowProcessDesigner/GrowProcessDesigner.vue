<template>
  <div
    class="grow-process-engine absolute inset-0 flex h-auto w-auto min-h-0 flex-col overflow-hidden bg-layout"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <div
      class="box-border flex h-10 w-full shrink-0 items-center justify-between gap-3 border-b border-solid border-border bg-component px-3"
      @click.stop
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <GrowInput
          :model-value="flow.name"
          size="small"
          class="!w-[200px]"
          placeholder="流程名称"
          @update:model-value="onNameChange"
        />
        <span class="process-status-tag" :class="`is-${flow.status}`">
          {{ flow.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <span class="hidden text-xs text-text-secondary md:inline">
          从上往下编排：节点底部拖出，接到下一节点顶部；允许成环（回退/跳转）
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GrowButton class="!ml-0" size="small" type="primary" :loading="saving" @click="onSave">
          <GrowIconify icon="carbon:save" :size="14" />
          保存
        </GrowButton>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <NodePalette />

      <div
        class="relative min-h-0 min-w-0 flex-1 overflow-hidden"
        @dragover.prevent
        @drop="onDrop"
      >
        <VueFlow
          :id="FLOW_ID"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :edge-types="edgeTypes"
          :default-viewport="DEFAULT_VIEWPORT"
          :min-zoom="0.3"
          :max-zoom="1.4"
          :nodes-draggable="true"
          :nodes-connectable="true"
          :edges-updatable="false"
          :connection-mode="ConnectionMode.Strict"
          :is-valid-connection="isValidConnection"
          :delete-key-code="null"
          elements-selectable
          class="process-flow h-full w-full"
          @node-drag-stop="onNodeDragStop"
          @connect="onConnect"
          @edge-update="onEdgeUpdate"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
          @edges-change="onEdgesChange"
        >
          <Background :gap="16" pattern-color="var(--layout-border-color)" />
          <Controls position="bottom-left" />
        </VueFlow>

        <div
          v-if="!flow.nodes.length"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            class="rounded-md border border-dashed border-border bg-component/80 px-4 py-3 text-center text-xs text-text-secondary"
          >
            从左侧组件库拖拽节点到此处开始编排
          </div>
        </div>

        <ProcessConfigFloat
          :visible="!!selectedNode || !!selectedEdge"
          :title="configTitle"
          @close="closeConfig"
        >
          <NodeConfigPanel
            :node="selectedNode"
            :edge="selectedEdge"
            @update-node="onUpdateNode"
            @update-edge="onUpdateEdge"
          />
        </ProcessConfigFloat>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, markRaw, nextTick, ref, watch } from 'vue'
import {
  VueFlow,
  useVueFlow,
  MarkerType,
  ConnectionMode,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeMouseEvent,
  type EdgeUpdateEvent,
  type Node,
  type NodeDragEvent,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import ProcessFlowNode from './components/canvas/ProcessFlowNode.vue'
import ProcessFlowEdge from './components/canvas/ProcessFlowEdge.vue'
import ProcessConfigFloat from './components/config/ProcessConfigFloat.vue'
import NodeConfigPanel from './components/config/NodeConfigPanel.vue'
import NodePalette from './components/palette/NodePalette.vue'
import {
  cloneProcessFlow,
  createProcessFlow,
  createProcessFlowEdge,
  createProcessFlowNode,
} from './factories'
import { NODE_TYPE_META } from './static/nodeCatalog'
import {
  canConnectNodes,
  resolveSourceHandle,
  resolveTargetHandle,
} from './utils/connection'
import {
  branchHandleId,
  getNodeBranchArms,
  listBranchHandleIds,
  normalizeConditionBranches,
  normalizeParallelBranches,
} from './utils/branches'
import type {
  ProcessFlow,
  ProcessFlowEdge as ProcessFlowEdgeModel,
  ProcessFlowNode as ProcessFlowNodeModel,
  ProcessNodeType,
  ProcessParallelBranchConfig,
  ProcessConditionBranchConfig,
} from './types'

defineOptions({
  name: 'GrowProcessDesigner',
})

const DEFAULT_VIEWPORT = { zoom: 1, x: 40, y: 40 } as const
const FLOW_ID = 'grow-process-engine-designer'

const props = withDefaults(
  defineProps<{
    modelValue?: ProcessFlow
  }>(),
  {
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ProcessFlow]
  change: [value: ProcessFlow]
  save: [value: ProcessFlow]
}>()

const { project, removeNodes, removeEdges, updateNodeInternals } = useVueFlow({
  id: FLOW_ID,
})

const flow = ref<ProcessFlow>(
  ensureBranchFlowShape(
    props.modelValue
      ? cloneProcessFlow(props.modelValue)
      : createProcessFlow({ name: '未命名流程' }),
  ),
)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const saving = ref(false)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      flow.value = ensureBranchFlowShape(cloneProcessFlow(val))
      syncFlowToCanvas()
    }
  },
)

const selectedNode = computed(
  () => flow.value.nodes.find((item) => item.id === selectedNodeId.value) || null,
)

const selectedEdge = computed(
  () => flow.value.edges.find((item) => item.id === selectedEdgeId.value) || null,
)

const configTitle = computed(() => {
  if (selectedNode.value) return `配置 · ${selectedNode.value.name}`
  if (selectedEdge.value) {
    return `配置 · 连线${selectedEdge.value.label ? `（${selectedEdge.value.label}）` : ''}`
  }
  return '配置'
})

const ProcessNodeView = defineComponent({
  name: 'ProcessFlowNodeView',
  props: {
    id: { type: String, required: true },
    data: { type: Object, required: true },
  },
  setup(p) {
    const branchKey = computed(() =>
      (p.data?.branchOutputs || [])
        .map((item: { id: string }) => item.id)
        .join('|'),
    )

    watch(
      branchKey,
      async () => {
        await nextTick()
        updateNodeInternals([p.id])
      },
    )

    return () =>
      h(ProcessFlowNode, {
        key: `${p.id}:${branchKey.value}`,
        id: p.id,
        selected: !!p.data.selected,
        name: p.data.name,
        nodeType: p.data.nodeType,
        branchOutputs: p.data.branchOutputs || [],
        onSelect: (id: string) => {
          selectedNodeId.value = id
          selectedEdgeId.value = null
        },
      })
  },
})

const nodeTypes = {
  'process-node': markRaw(ProcessNodeView),
}

const edgeTypes = {
  'process-edge': markRaw(ProcessFlowEdge),
}

function ensureBranchFlowShape(source: ProcessFlow): ProcessFlow {
  const nodes = source.nodes
    .filter((item) => !!NODE_TYPE_META[item.type as ProcessNodeType])
    .map((item) => {
    if (item.type === 'condition-branch') {
      const cfg = item.config as ProcessConditionBranchConfig
      const branches = normalizeConditionBranches(cfg)
      return {
        ...item,
        config: {
          ...cfg,
          branches,
        } as ProcessConditionBranchConfig,
      }
    }
    if (item.type === 'parallel-branch') {
      const cfg = item.config as ProcessParallelBranchConfig
      const branches = normalizeParallelBranches(cfg)
      return {
        ...item,
        config: {
          ...cfg,
          branches,
        } as ProcessParallelBranchConfig,
      }
    }
    return item
  })

  const nodeIds = new Set(nodes.map((item) => item.id))
  const nodeMap = new Map(nodes.map((item) => [item.id, item]))
  const edges = source.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => {
    const sourceNode = nodeMap.get(edge.source)
    if (
      !sourceNode ||
      (sourceNode.type !== 'condition-branch' && sourceNode.type !== 'parallel-branch')
    ) {
      return {
        ...edge,
        sourceHandle: resolveSourceHandle(edge.sourceHandle),
        targetHandle: resolveTargetHandle(edge.targetHandle),
      }
    }
    const arms = getNodeBranchArms(sourceNode)
    let sourceHandle = edge.sourceHandle
    if (sourceHandle === 'out-true' || sourceHandle === 'out-p1') {
      sourceHandle = arms[0] ? branchHandleId(arms[0].id) : sourceHandle
    } else if (sourceHandle === 'out-false' || sourceHandle === 'out-p2') {
      sourceHandle = arms[1]
        ? branchHandleId(arms[1].id)
        : arms[0]
          ? branchHandleId(arms[0].id)
          : sourceHandle
    } else {
      sourceHandle = resolveSourceHandle(sourceHandle)
    }
    return {
      ...edge,
      sourceHandle,
      targetHandle: resolveTargetHandle(edge.targetHandle),
    }
  })

  return { ...source, nodes, edges }
}

function syncFlowToCanvas() {
  nodes.value = flow.value.nodes.map((item) => {
    const branchOutputs =
      item.type === 'condition-branch' || item.type === 'parallel-branch'
        ? getNodeBranchArms(item)
        : []
    return {
      id: item.id,
      type: 'process-node',
      position: { ...item.position },
      selected: item.id === selectedNodeId.value,
      data: {
        selected: item.id === selectedNodeId.value,
        name: item.name,
        nodeType: item.type,
        branchOutputs,
      },
    }
  })
  edges.value = flow.value.edges.map((item) => ({
    id: item.id,
    type: 'process-edge',
    source: item.source,
    target: item.target,
    sourceHandle: resolveSourceHandle(item.sourceHandle),
    targetHandle: resolveTargetHandle(item.targetHandle),
    animated: true,
    selectable: true,
    deletable: true,
    focusable: true,
    updatable: false,
    selected: item.id === selectedEdgeId.value,
    interactionWidth: 28,
    style: { stroke: 'var(--primary-color)' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--primary-color)',
    },
    data: {
      edgeId: item.id,
      active: item.id === selectedEdgeId.value,
      label: item.label || '连线',
      onSelect: (edgeId: string) => {
        selectedEdgeId.value = edgeId
        selectedNodeId.value = null
      },
      onRemove: (edgeId: string) => {
        removeFlowEdge(edgeId)
      },
    },
  }))

  const branchNodeIds = flow.value.nodes
    .filter(
      (item) =>
        item.type === 'condition-branch' || item.type === 'parallel-branch',
    )
    .map((item) => item.id)
  if (branchNodeIds.length) {
    nextTick(() => {
      updateNodeInternals(branchNodeIds)
    })
  }
}

function commit(emitSave = false) {
  flow.value = {
    ...flow.value,
    updatedAt: new Date().toISOString(),
  }
  const cloned = cloneProcessFlow(flow.value)
  emit('update:modelValue', cloned)
  emit('change', cloned)
  if (emitSave) emit('save', cloned)
  syncFlowToCanvas()
}

watch(
  [flow, selectedNodeId, selectedEdgeId],
  () => {
    syncFlowToCanvas()
  },
  { immediate: true, deep: true },
)

function closeConfig() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

function onNameChange(value: string | number | null) {
  flow.value = { ...flow.value, name: String(value ?? '') }
  commit()
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

function onNodeClick({ node }: NodeMouseEvent) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
}

function removeFlowEdge(edgeId: string) {
  flow.value = {
    ...flow.value,
    edges: flow.value.edges.filter((item) => item.id !== edgeId),
  }
  if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null
  removeEdges([edgeId])
  commit()
}

function onUpdateNode(id: string, patch: Partial<ProcessFlowNodeModel>) {
  const nextNodes = flow.value.nodes.map((item) =>
    item.id === id
      ? { ...item, ...patch, config: (patch.config as any) ?? item.config }
      : item,
  )
  let nextEdges = flow.value.edges
  const updated = nextNodes.find((item) => item.id === id)
  if (
    updated &&
    (updated.type === 'condition-branch' || updated.type === 'parallel-branch')
  ) {
    const validHandles = new Set(listBranchHandleIds(updated))
    nextEdges = flow.value.edges.filter((edge) => {
      if (edge.source !== id) return true
      const handle = resolveSourceHandle(edge.sourceHandle)
      if (!String(handle).startsWith('out-b-')) return true
      return validHandles.has(handle)
    })
    if (
      selectedEdgeId.value &&
      !nextEdges.some((edge) => edge.id === selectedEdgeId.value)
    ) {
      selectedEdgeId.value = null
    }
  }
  flow.value = {
    ...flow.value,
    nodes: nextNodes,
    edges: nextEdges,
  }
  commit()
  if (
    updated &&
    (updated.type === 'condition-branch' || updated.type === 'parallel-branch')
  ) {
    nextTick(() => {
      updateNodeInternals([id])
    })
  }
}

function onUpdateEdge(id: string, patch: Partial<ProcessFlowEdgeModel>) {
  flow.value = {
    ...flow.value,
    edges: flow.value.edges.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  }
  commit()
}

function onNodeDragStop(event: NodeDragEvent) {
  const { node } = event
  flow.value = {
    ...flow.value,
    nodes: flow.value.nodes.map((item) =>
      item.id === node.id
        ? { ...item, position: { x: node.position.x, y: node.position.y } }
        : item,
    ),
  }
  commit()
}

function isValidConnection(connection: Connection | Edge) {
  const source = connection.source
  const target = connection.target
  if (!source || !target) return false
  // Vue Flow 在写入 edges 时会对每条边再跑一遍校验；需忽略自身 id，否则会被「重复连线」误杀
  const ignoreEdgeId = 'id' in connection && connection.id ? String(connection.id) : undefined
  return canConnectNodes(flow.value, source, target, {
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    ignoreEdgeId,
  })
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return
  if (!isValidConnection(connection)) return
  const sourceHandle = resolveSourceHandle(connection.sourceHandle)
  const targetHandle = resolveTargetHandle(connection.targetHandle)

  const edge = createProcessFlowEdge({
    source: connection.source,
    target: connection.target,
    sourceHandle,
    targetHandle,
  })
  flow.value = {
    ...flow.value,
    edges: [...flow.value.edges, edge],
  }
  commit()
}

function onEdgeUpdate({ edge, connection }: EdgeUpdateEvent) {
  if (!connection.source || !connection.target) return
  if (
    !canConnectNodes(flow.value, connection.source, connection.target, {
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      ignoreEdgeId: edge.id,
    })
  ) {
    return
  }
  const sourceHandle = resolveSourceHandle(connection.sourceHandle || edge.sourceHandle)
  const targetHandle = resolveTargetHandle(connection.targetHandle || edge.targetHandle)

  flow.value = {
    ...flow.value,
    edges: flow.value.edges.map((item) =>
      item.id === edge.id
        ? {
            ...item,
            source: connection.source!,
            target: connection.target!,
            sourceHandle,
            targetHandle,
          }
        : item,
    ),
  }
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
  commit()
}

function onEdgesChange(changes: EdgeChange[]) {
  const removed = changes.filter((item) => item.type === 'remove').map((item) => item.id)
  if (!removed.length) return
  const removeSet = new Set(removed)
  flow.value = {
    ...flow.value,
    edges: flow.value.edges.filter((item) => !removeSet.has(item.id)),
  }
  if (selectedEdgeId.value && removeSet.has(selectedEdgeId.value)) {
    selectedEdgeId.value = null
  }
  commit()
}

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData(
    'application/grow-process-engine-node',
  ) as ProcessNodeType
  if (!type || !NODE_TYPE_META[type]) return

  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  })

  const node = createProcessFlowNode(type, {
    position: { x: position.x - 100, y: position.y - 40 },
  })
  flow.value = {
    ...flow.value,
    nodes: [...flow.value.nodes, node],
  }
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  commit()
}

async function onSave() {
  saving.value = true
  try {
    commit(true)
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return
  const target = event.target as HTMLElement | null
  const tag = target?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
    return
  }

  if (selectedEdgeId.value) {
    event.preventDefault()
    removeFlowEdge(selectedEdgeId.value)
    return
  }

  if (!selectedNodeId.value) return
  event.preventDefault()
  const id = selectedNodeId.value
  flow.value = {
    ...flow.value,
    nodes: flow.value.nodes.filter((item) => item.id !== id),
    edges: flow.value.edges.filter((item) => item.source !== id && item.target !== id),
  }
  selectedNodeId.value = null
  removeNodes([id])
  removeEdges(edges.value.filter((e) => e.source === id || e.target === id).map((e) => e.id))
  commit()
}

defineExpose({
  getFlow: () => cloneProcessFlow(flow.value),
  setFlow: (next: ProcessFlow) => {
    flow.value = cloneProcessFlow(next)
    selectedNodeId.value = null
    selectedEdgeId.value = null
    commit()
  },
})
</script>

<style scoped>
.grow-process-engine {
  --process-cat-human: #2563eb;
  --process-cat-event: #d97706;
  --process-cat-system: #0d9488;
  --process-cat-state: #7c3aed;
  --process-cat-decision: #db2777;
  --process-cat-branch: #0891b2;
}

.process-status-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--layout-border-color);
  color: var(--text-color-secondary);
  background: color-mix(in srgb, var(--text-color) 4%, var(--component-background-color));
}

.process-status-tag.is-published {
  color: var(--process-cat-system);
  border-color: color-mix(in srgb, var(--process-cat-system) 40%, var(--layout-border-color));
  background: color-mix(in srgb, var(--process-cat-system) 12%, var(--component-background-color));
}

.process-flow {
  --vf-connection-path: var(--primary-color);
  --vf-handle: var(--primary-color);
  background: var(--layout-container-background-color);
}

.process-flow :deep(.vue-flow__node-process-node) {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: left;
}

.process-flow :deep(.vue-flow__edge-path),
.process-flow :deep(.vue-flow__connection-path) {
  stroke: var(--primary-color);
}

.process-flow :deep(.vue-flow__controls) {
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: none;
  background: var(--component-background-color);
}

.process-flow :deep(.vue-flow__controls-button) {
  border: none;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
  color: var(--text-color);
  fill: var(--text-color);
}

.process-flow :deep(.vue-flow__controls-button:hover) {
  background: color-mix(in srgb, var(--text-color) 6%, var(--component-background-color));
}
</style>
