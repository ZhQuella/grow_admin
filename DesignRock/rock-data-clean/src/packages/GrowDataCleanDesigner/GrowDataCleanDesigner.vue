<template>
  <div
    class="grow-data-clean absolute inset-0 flex h-auto w-auto min-h-0 flex-col overflow-hidden bg-layout"
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
          placeholder="清洗流名称"
          @update:model-value="onNameChange"
        />
        <span class="clean-status-tag" :class="`is-${flow.status}`">
          {{ flow.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <span class="hidden text-xs text-text-secondary md:inline">
          从节点右侧拖出，接到另一节点左侧；可一对多 / 多对一自由组合
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GrowButton size="small" :loading="previewing" @click="onPreview">
          <GrowIconify icon="carbon:data-view" :size="14" />
          预览
        </GrowButton>
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
          id="grow-data-clean-designer"
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
          :is-valid-connection="isValidConnection"
          :delete-key-code="['Backspace', 'Delete']"
          elements-selectable
          class="clean-flow h-full w-full"
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
          <div class="rounded-md border border-dashed border-border bg-component/80 px-4 py-3 text-center text-xs text-text-secondary">
            从左侧组件库拖拽节点到此处开始编排
          </div>
        </div>

        <CleanConfigFloat
          :visible="!!selectedNode"
          :title="selectedNode ? `配置 · ${selectedNode.name}` : '节点配置'"
          @close="closeNodeConfig"
        >
          <NodeConfigPanel
            v-if="selectedNode"
            :node="selectedNode"
            :field-candidates="configFieldCandidates"
            @update-node="onUpdateNode"
          />
        </CleanConfigFloat>
      </div>
    </div>

    <CleanPreviewPanel
      :result="previewResult"
      :node-name="selectedNode?.name || null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, markRaw, onMounted, ref, watch } from 'vue'
import {
  VueFlow,
  useVueFlow,
  MarkerType,
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

import CleanFlowNode from './components/canvas/CleanFlowNode.vue'
import CleanFlowEdge from './components/canvas/CleanFlowEdge.vue'
import NodePalette from './components/palette/NodePalette.vue'
import CleanConfigFloat from './components/config/CleanConfigFloat.vue'
import NodeConfigPanel from './components/config/NodeConfigPanel.vue'
import CleanPreviewPanel from './components/preview/CleanPreviewPanel.vue'
import {
  cloneCleanFlow,
  createCleanFlow,
  createCleanFlowEdge,
  createCleanFlowNode,
} from './factories'
import { NODE_TYPE_META } from './static/nodeCatalog'
import { buildCleanTableRowsMap, findDemoTable, type CleanTableRowsMap } from './static/demoTables'
import { loadCleanTableRowsMap } from './utils/api'
import { countOutputNodes, runCleanFlowLocal } from './utils/runCleanFlow'
import type {
  CleanFlow,
  CleanFlowNode as CleanFlowNodeModel,
  CleanNodeType,
  CleanPreviewColumn,
  CleanPreviewResult,
  CleanTableSourceConfig,
} from './types'

const PREVIEW_LIMIT = 50

defineOptions({
  name: 'GrowDataCleanDesigner',
})

const DEFAULT_VIEWPORT = { zoom: 1, x: 40, y: 40 } as const
const FLOW_ID = 'grow-data-clean-designer'

const props = withDefaults(
  defineProps<{
    modelValue?: CleanFlow
  }>(),
  {
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: CleanFlow]
  change: [value: CleanFlow]
  save: [value: CleanFlow]
}>()

const { project, removeNodes, removeEdges } = useVueFlow({ id: FLOW_ID })

const flow = ref<CleanFlow>(
  props.modelValue ? cloneCleanFlow(props.modelValue) : createCleanFlow({ name: '未命名清洗流' }),
)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const saving = ref(false)
const previewing = ref(false)
const previewResult = ref<CleanPreviewResult | null>(null)
const tableRowsMap = ref<CleanTableRowsMap>(buildCleanTableRowsMap())
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      flow.value = cloneCleanFlow(val)
      syncFlowToCanvas()
    }
  },
)

onMounted(() => {
  loadCleanTableRowsMap()
    .then((map) => {
      tableRowsMap.value = map
    })
    .catch(() => {
      // 已有本地 demo 回退
    })
})

const selectedNode = computed(
  () => flow.value.nodes.find((item) => item.id === selectedNodeId.value) || null,
)

/** 配置面板字段候选：表源用表结构；其它节点取直接上游列（避免受自身变换影响） */
const configFieldCandidates = computed<CleanPreviewColumn[]>(() => {
  const node = selectedNode.value
  if (!node) return []

  if (node.type === 'table') {
    const config = (node.config || {}) as CleanTableSourceConfig
    const key = config.refId || config.tableId || config.tableName || ''
    const demo = findDemoTable(key)
    return (demo?.columns || []).map((col) => ({
      key: col.key,
      title: col.title || col.key,
      dataType: col.dataType,
    }))
  }

  const upstreamId = flow.value.edges.find((edge) => edge.target === node.id)?.source
  if (!upstreamId) return []
  const up = runCleanFlowLocal(cloneCleanFlow(flow.value), {
    targetNodeId: upstreamId,
    tableRows: tableRowsMap.value,
    limit: 1,
  })
  if (up.error) return []
  return (up.columns || []).map((col) => ({
    key: col.key,
    title: col.title || col.key,
    dataType: col.dataType,
  }))
})

const CleanNodeView = defineComponent({
  name: 'CleanFlowNodeView',
  props: {
    id: { type: String, required: true },
    data: { type: Object, required: true },
  },
  setup(p) {
    return () =>
      h(CleanFlowNode, {
        id: p.id,
        selected: !!p.data.selected,
        name: p.data.name,
        nodeType: p.data.nodeType,
        inputRows: p.data.inputRows,
        outputRows: p.data.outputRows,
        onSelect: (id: string) => {
          selectedNodeId.value = id
          selectedEdgeId.value = null
          void runPreview({ targetNodeId: id })
        },
      })
  },
})

const nodeTypes = {
  'clean-node': markRaw(CleanNodeView),
}

const edgeTypes = {
  'clean-edge': markRaw(CleanFlowEdge),
}

function syncFlowToCanvas() {
  nodes.value = flow.value.nodes.map((item) => ({
    id: item.id,
    type: 'clean-node',
    position: { ...item.position },
    selected: item.id === selectedNodeId.value,
    data: {
      selected: item.id === selectedNodeId.value,
      name: item.name,
      nodeType: item.type,
      inputRows: item.stats?.inputRows ?? null,
      outputRows: item.stats?.outputRows ?? null,
    },
  }))
  edges.value = flow.value.edges.map((item) => ({
    id: item.id,
    type: 'clean-edge',
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
      onSelect: (edgeId: string) => {
        selectedEdgeId.value = edgeId
        selectedNodeId.value = null
        previewResult.value = null
      },
      onRemove: (edgeId: string) => {
        removeFlowEdge(edgeId)
      },
    },
  }))
}

function closeNodeConfig() {
  selectedNodeId.value = null
}

function commit(emitSave = false) {
  syncFlowToCanvas()
  const cloned = cloneCleanFlow(flow.value)
  cloned.updatedAt = new Date().toISOString()
  flow.value.updatedAt = cloned.updatedAt
  emit('update:modelValue', cloned)
  emit('change', cloned)
  if (emitSave) emit('save', cloned)
}

watch(
  [flow, selectedNodeId, selectedEdgeId],
  () => {
    syncFlowToCanvas()
  },
  { deep: true, immediate: true },
)

function onNameChange(value: string | number | null) {
  flow.value = { ...flow.value, name: String(value ?? '') }
  commit()
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  previewResult.value = null
}

function onNodeClick({ node }: NodeMouseEvent) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  void runPreview({ targetNodeId: node.id })
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
  previewResult.value = null
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

function onUpdateNode(
  id: string,
  patch: Partial<CleanFlowNodeModel>,
  options?: { skipPreview?: boolean },
) {
  flow.value = {
    ...flow.value,
    nodes: flow.value.nodes.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
            config: (patch.config as CleanFlowNodeModel['config']) || item.config,
            stats: patch.stats ? { ...item.stats, ...patch.stats } : item.stats,
          }
        : item,
    ),
  }
  commit()
  if (!options?.skipPreview && selectedNodeId.value === id) {
    void runPreview({ targetNodeId: id })
  }
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

function wouldCreateCycle(source: string, target: string, ignoreEdgeId?: string) {
  if (source === target) return true
  const adj = new Map<string, string[]>()
  for (const edge of flow.value.edges) {
    if (ignoreEdgeId && edge.id === ignoreEdgeId) continue
    const list = adj.get(edge.source) || []
    list.push(edge.target)
    adj.set(edge.source, list)
  }
  const stack = [target]
  const seen = new Set<string>()
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === source) return true
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const next of adj.get(cur) || []) stack.push(next)
  }
  return false
}

function resolveSourceHandle(handleId?: string | null) {
  if (
    handleId === 'out-right' ||
    handleId === 'out-right-top' ||
    handleId === 'out-right-bottom' ||
    handleId === 'out-true' ||
    handleId === 'out-false'
  ) {
    return handleId
  }
  return 'out-right'
}

function resolveTargetHandle(handleId?: string | null) {
  if (
    handleId === 'in-left' ||
    handleId === 'in-left-top' ||
    handleId === 'in-left-bottom'
  ) {
    return handleId
  }
  return 'in-left'
}

function canAcceptLink(sourceId: string, targetId: string, ignoreEdgeId?: string) {
  if (!sourceId || !targetId || sourceId === targetId) return false
  const sourceNode = flow.value.nodes.find((item) => item.id === sourceId)
  const targetNode = flow.value.nodes.find((item) => item.id === targetId)
  if (!sourceNode || !targetNode) return false
  if (NODE_TYPE_META[sourceNode.type].outputs <= 0) return false
  if (NODE_TYPE_META[targetNode.type].inputs <= 0) return false
  if (wouldCreateCycle(sourceId, targetId, ignoreEdgeId)) return false
  return true
}

function isDuplicateEdge(
  source: string,
  target: string,
  sourceHandle?: string | null,
  ignoreEdgeId?: string,
) {
  const normalizedSourceHandle = resolveSourceHandle(sourceHandle)
  return flow.value.edges.some(
    (item) =>
      item.id !== ignoreEdgeId &&
      item.source === source &&
      item.target === target &&
      resolveSourceHandle(item.sourceHandle) === normalizedSourceHandle,
  )
}

function isValidConnection(connection: Connection | Edge) {
  const source = connection.source
  const target = connection.target
  if (!source || !target) return false
  // 必须从输出锚点拖向输入锚点，保证箭头方向与拖拽一致
  if (connection.sourceHandle && !String(connection.sourceHandle).startsWith('out')) {
    return false
  }
  if (connection.targetHandle && !String(connection.targetHandle).startsWith('in')) {
    return false
  }
  return canAcceptLink(source, target)
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return
  if (!isValidConnection(connection)) return
  const sourceHandle = resolveSourceHandle(connection.sourceHandle)
  const targetHandle = resolveTargetHandle(connection.targetHandle)
  if (isDuplicateEdge(connection.source, connection.target, sourceHandle)) return

  const edge = createCleanFlowEdge({
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
    connection.sourceHandle &&
    !String(connection.sourceHandle).startsWith('out')
  ) {
    return
  }
  if (connection.targetHandle && !String(connection.targetHandle).startsWith('in')) {
    return
  }
  if (!canAcceptLink(connection.source, connection.target, edge.id)) return
  const sourceHandle = resolveSourceHandle(
    connection.sourceHandle || edge.sourceHandle,
  )
  const targetHandle = resolveTargetHandle(
    connection.targetHandle || edge.targetHandle,
  )
  if (isDuplicateEdge(connection.source, connection.target, sourceHandle, edge.id)) {
    return
  }

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
  const type = event.dataTransfer?.getData('application/grow-data-clean-node') as CleanNodeType
  if (!type || !NODE_TYPE_META[type]) return

  if (type === 'output' && countOutputNodes(flow.value) >= 1) {
    previewResult.value = {
      columns: [],
      rows: [],
      error: '画布上只能有一个「数据输出」节点',
    }
    return
  }

  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  })

  const node = createCleanFlowNode(type, {
    position: { x: position.x - 100, y: position.y - 40 },
  })
  flow.value = {
    ...flow.value,
    nodes: [...flow.value.nodes, node],
  }
  selectedNodeId.value = node.id
  commit()
  void runPreview({ targetNodeId: node.id })
}

async function runPreview(options: { targetNodeId?: string; toOutput?: boolean }) {
  previewing.value = true
  try {
    const snapshot = cloneCleanFlow(flow.value)
    const result = runCleanFlowLocal(snapshot, {
      ...options,
      tableRows: tableRowsMap.value,
      limit: PREVIEW_LIMIT,
    })
    previewResult.value = result

    const targetId = result.targetNodeId || options.targetNodeId
    if (targetId && !result.error) {
      const upstreamIds = [
        ...new Set(
          snapshot.edges.filter((edge) => edge.target === targetId).map((edge) => edge.source),
        ),
      ]
      let inputRows = result.rows.length
      if (upstreamIds.length) {
        const up = runCleanFlowLocal(snapshot, {
          targetNodeId: upstreamIds[0],
          tableRows: tableRowsMap.value,
          limit: PREVIEW_LIMIT,
        })
        if (!up.error) inputRows = up.rows.length
      }
      onUpdateNode(
        targetId,
        {
          stats: {
            inputRows,
            outputRows: result.rows.length,
          },
        },
        { skipPreview: true },
      )
    }
  } finally {
    previewing.value = false
  }
}

function onPreview() {
  if (selectedNodeId.value) {
    void runPreview({ targetNodeId: selectedNodeId.value })
    return
  }
  void runPreview({ toOutput: true })
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
  previewResult.value = null
  removeNodes([id])
  removeEdges(edges.value.filter((e) => e.source === id || e.target === id).map((e) => e.id))
  commit()
}

defineExpose({
  getFlow: () => cloneCleanFlow(flow.value),
  setFlow: (next: CleanFlow) => {
    flow.value = cloneCleanFlow(next)
    selectedNodeId.value = null
    selectedEdgeId.value = null
    previewResult.value = null
    commit()
  },
})
</script>

<style scoped>
.grow-data-clean {
  --clean-cat-source: #0d9488;
  --clean-cat-clean: #d97706;
  --clean-cat-merge: #7c3aed;
  --clean-cat-agg: #4f46e5;
  --clean-cat-output: #059669;
}

.clean-status-tag {
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

.clean-status-tag.is-published {
  color: var(--clean-cat-output);
  border-color: color-mix(in srgb, var(--clean-cat-output) 40%, var(--layout-border-color));
  background: color-mix(in srgb, var(--clean-cat-output) 12%, var(--component-background-color));
}

.clean-flow {
  --vf-connection-path: var(--primary-color);
  --vf-handle: var(--primary-color);
  background: var(--layout-container-background-color);
}

.clean-flow :deep(.vue-flow__node-clean-node) {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: left;
}

.clean-flow :deep(.vue-flow__edge-path),
.clean-flow :deep(.vue-flow__connection-path) {
  stroke: var(--primary-color);
}

.clean-flow :deep(.vue-flow__controls) {
  box-shadow: var(--card-shadow);
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--component-background-color);
}

.clean-flow :deep(.vue-flow__controls-button) {
  background: var(--component-background-color);
  border-bottom: 1px solid var(--layout-border-color);
  fill: var(--text-color);
  color: var(--text-color);
}

.clean-flow :deep(.vue-flow__controls-button:hover) {
  background: color-mix(in srgb, var(--text-color) 8%, transparent);
}

.clean-flow :deep(.vue-flow__controls-button svg) {
  fill: currentColor;
}
</style>
