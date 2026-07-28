<template>
  <div
    class="absolute inset-0 flex h-auto w-auto min-h-0 flex-col overflow-hidden bg-layout"
    tabindex="-1"
    @click="onDeselect"
    @keydown="onDesignerKeydown"
  >
    <div
      class="box-border flex h-10 w-full shrink-0 items-center justify-between gap-3 border-b border-solid border-border bg-component px-3"
      @click.stop
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <GrowButton size="small" type="primary" @click="onAddTable">
          <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
          添加表
        </GrowButton>
        <GrowButton class="!ml-0" size="small" :disabled="!schema.tables.length" @click="onClear">
          <GrowIconify icon="carbon:erase" :size="14" class="mr-1 align-[-2px]" />
          清空
        </GrowButton>
        <span class="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-text-secondary">
          拖拽字段圆点连线创建关联；悬停关联线可点垃圾桶删除
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GrowButton size="small" :disabled="!schema.tables.length" @click="onCopyJson">
          <GrowIconify icon="carbon:copy" :size="14" class="mr-1 align-[-2px]" />
          复制 JSON
        </GrowButton>
        <GrowButton class="!ml-0" size="small" type="primary" :disabled="!schema.tables.length" @click="onExportJson">
          <GrowIconify icon="carbon:download" :size="14" class="mr-1 align-[-2px]" />
          导出 JSON
        </GrowButton>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <aside class="schema-rail" @click.stop>
        <div
          v-for="item in railItems"
          :key="item.type"
          class="schema-rail-item"
          :class="{ 'is-active': sidePanel === item.type }"
          :data-tip="item.label"
          :title="item.label"
          role="button"
          tabindex="0"
          @click="onRailClick(item.type)"
        >
          <GrowIconify :icon="item.icon" :size="18" class="schema-rail-icon" />
        </div>
      </aside>

      <div
        v-if="sidePanel"
        class="relative z-20 w-[320px] shrink-0 border-r border-solid border-border bg-component"
        @click.stop
      >
        <div
          class="box-border flex h-10 min-w-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
        >
          <h4
            class="schema-side-panel-title m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-text"
            :title="sidePanelTitle"
          >
            {{ sidePanelTitle }}
          </h4>
          <GrowButton
            text
            size="small"
            class="!shrink-0 !px-1"
            title="关闭"
            @click="sidePanel = null"
          >
            <GrowIconify icon="carbon:close" :size="15" />
          </GrowButton>
        </div>
        <div class="absolute bottom-0 left-0 right-0 top-10 overflow-hidden">
          <SchemaMetaPanel
            v-if="sidePanel === 'meta'"
            :schema="schema"
            @change="onMetaChange"
          />
          <TableConfigPanel
            v-else-if="sidePanel === 'table' && activeTable"
            :table="activeTable"
            :active-column-id="activeColumnId"
            @update-table="onUpdateTable"
            @update-column="onUpdateColumn"
            @add-column="onAddColumn"
            @remove-column="onRemoveColumn"
            @select-column="(id) => (activeColumnId = id)"
          />
          <RelationConfigPanel
            v-else-if="sidePanel === 'relation' && activeRelation"
            :relation="activeRelation"
            :schema="schema"
            @change="onUpdateRelation"
          />
          <div v-else class="px-3 py-8 text-center text-xs text-text-secondary">
            {{ emptyPanelHint }}
          </div>
        </div>
      </div>

      <div class="relative min-h-0 min-w-0 flex-1" @click.stop>
        <VueFlow
          id="grow-schema-designer"
          v-model:nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :edge-types="edgeTypes"
          :default-viewport="DEFAULT_VIEWPORT"
          :min-zoom="0.2"
          :max-zoom="1.25"
          :delete-key-code="['Backspace', 'Delete']"
          :edges-updatable="false"
          elements-selectable
          class="schema-flow h-full w-full"
          @node-drag-stop="onNodeDragStop"
          @connect="onConnect"
          @edge-click="onEdgeClick"
          @edges-change="onEdgesChange"
          @pane-click="onDeselect"
        >
          <Background :gap="16" pattern-color="var(--layout-border-color)" />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            :node-color="() => 'var(--primary-color)'"
            :node-stroke-color="() => 'var(--layout-border-color)'"
            mask-color="color-mix(in srgb, var(--layout-container-background-color) 55%, transparent)"
            pannable
            zoomable
          />
        </VueFlow>
      </div>
    </div>

    <CreateRelationDrawer
      v-model:visible="relationDraft.visible"
      :source-table="relationDraft.sourceTable"
      :source-column-id="relationDraft.sourceColumnId"
      :target-table="relationDraft.targetTable"
      :target-column-id="relationDraft.targetColumnId"
      @confirm="onConfirmRelation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, reactive, ref, watch } from 'vue'
import { defineComponent, h } from 'vue'
import {
  VueFlow,
  useVueFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeMouseEvent,
  type Node,
  type NodeDragEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import TableNode from './components/TableNode.vue'
import RelationEdge from './components/RelationEdge.vue'
import TableConfigPanel from './components/TableConfigPanel.vue'
import RelationConfigPanel from './components/RelationConfigPanel.vue'
import SchemaMetaPanel from './components/SchemaMetaPanel.vue'
import CreateRelationDrawer from './components/CreateRelationDrawer.vue'
import { confirmAction } from './confirmAction'
import { copySchemaJson, downloadSchemaJson } from './exportSchema'
import {
  createDatabaseSchema,
  createManyToManyArtifacts,
  createSchemaColumn,
  createSchemaRelation,
  createSchemaTable,
  ensureFkColumn,
  findPrimaryKeyColumn,
  nextColumnName,
  nextTableName,
} from './factories'
import {
  clampIdentifier,
  MAX_COLUMN_NAME_LENGTH,
  MAX_DATABASE_NAME_LENGTH,
  MAX_TABLE_NAME_LENGTH,
} from './mysqlTypes'
import {
  findRelationByEdgeId,
  relationsToEdges,
  tablesToNodes,
  type TableNodeData,
} from './flowMapper'
import type {
  DatabaseSchema,
  SchemaColumn,
  SchemaReferentialAction,
  SchemaRelation,
  SchemaRelationType,
  SchemaSelection,
  SchemaTable,
} from './types'

function cloneSchema(value: DatabaseSchema): DatabaseSchema {
  return JSON.parse(JSON.stringify(value)) as DatabaseSchema
}

defineOptions({
  name: 'GrowSchemaDesigner',
})

const DEFAULT_VIEWPORT = { zoom: 0.6, x: 40, y: 40 } as const
const { setViewport } = useVueFlow({ id: 'grow-schema-designer' })

const props = withDefaults(
  defineProps<{
    modelValue?: DatabaseSchema
  }>(),
  {
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: DatabaseSchema]
  change: [value: DatabaseSchema]
}>()

const schema = ref<DatabaseSchema>(
  props.modelValue ? cloneSchema(props.modelValue) : createDatabaseSchema(),
)

watch(
  () => props.modelValue,
  (val) => {
    if (val) schema.value = cloneSchema(val)
  },
)

const selection = ref<SchemaSelection>(null)
const activeColumnId = ref<string | null>(null)
const sidePanel = ref<'meta' | 'table' | 'relation' | null>('meta')

type RailType = 'meta' | 'table' | 'relation'
const railItems: { type: RailType; label: string; icon: string }[] = [
  { type: 'meta', label: '库信息', icon: 'carbon:db2-database' },
  { type: 'table', label: '表配置', icon: 'carbon:data-table' },
  { type: 'relation', label: '关联配置', icon: 'carbon:connectors' },
]

const nodes = ref<Node<TableNodeData>[]>([])
const edges = ref<Edge[]>([])

const TableNodeWrapper = defineComponent({
  name: 'SchemaTableNodeWrapper',
  props: {
    id: { type: String, required: true },
    data: { type: Object as () => TableNodeData, required: true },
  },
  setup(p) {
    return () =>
      h(TableNode, {
        data: p.data,
        onSelect: (tableId: string) => onSelectTable(tableId),
        onRemove: (tableId: string) => onRemoveTable(tableId),
      })
  },
})

const nodeTypes = {
  'schema-table': markRaw(TableNodeWrapper),
}

const edgeTypes = {
  'schema-relation': markRaw(RelationEdge),
}

const activeTableId = computed(() =>
  selection.value?.kind === 'table' ? selection.value.tableId : null,
)
const activeRelationId = computed(() =>
  selection.value?.kind === 'relation' ? selection.value.relationId : null,
)
const activeTable = computed(
  () => schema.value.tables.find((t) => t.id === activeTableId.value) ?? null,
)
const activeRelation = computed(
  () => schema.value.relations.find((r) => r.id === activeRelationId.value) ?? null,
)

const sidePanelTitle = computed(() => {
  if (sidePanel.value === 'meta') return '数据库'
  if (sidePanel.value === 'table') return activeTable.value ? `表 · ${activeTable.value.name}` : '表配置'
  if (sidePanel.value === 'relation') return '关联'
  return ''
})

const emptyPanelHint = computed(() => {
  if (sidePanel.value === 'table') return '请在画布中选择一张表'
  if (sidePanel.value === 'relation') return '请在画布中点击一条关联线'
  return ''
})

const relationDraft = reactive<{
  visible: boolean
  sourceTable: SchemaTable | null
  sourceColumnId: string | null
  targetTable: SchemaTable | null
  targetColumnId: string | null
}>({
  visible: false,
  sourceTable: null,
  sourceColumnId: null,
  targetTable: null,
  targetColumnId: null,
})

function syncFlow() {
  nodes.value = tablesToNodes(schema.value.tables, activeTableId.value)
  edges.value = relationsToEdges(schema.value, activeRelationId.value, {
    onSelect: (relationId) => {
      selection.value = { kind: 'relation', relationId }
      sidePanel.value = 'relation'
    },
    onRemove: (relationId) => {
      const rel = schema.value.relations.find((r) => r.id === relationId)
      if (rel) void removeRelation(rel, true)
    },
  })
}

function commit() {
  syncFlow()
  const cloned = cloneSchema(schema.value)
  emit('update:modelValue', cloned)
  emit('change', cloned)
}

watch(
  [schema, selection],
  () => {
    syncFlow()
  },
  { deep: true, immediate: true },
)

function onRailClick(type: RailType) {
  sidePanel.value = sidePanel.value === type ? null : type
}

function onDeselect() {
  selection.value = null
  activeColumnId.value = null
}

function onDesignerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return
  const target = event.target as HTMLElement | null
  const tag = target?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
    return
  }
  if (selection.value?.kind !== 'relation' || !activeRelation.value) return
  event.preventDefault()
  void removeRelation(activeRelation.value, false)
}

function onSelectTable(tableId: string) {
  selection.value = { kind: 'table', tableId }
  sidePanel.value = 'table'
  const table = schema.value.tables.find((t) => t.id === tableId)
  activeColumnId.value = table?.columns[0]?.id ?? null
}

function onMetaChange(patch: Partial<Pick<DatabaseSchema, 'name' | 'comment'>>) {
  const next = {
    ...patch,
    ...(patch.name != null
      ? { name: clampIdentifier(patch.name, MAX_DATABASE_NAME_LENGTH) }
      : null),
  }
  schema.value = { ...schema.value, ...next }
  commit()
}

function onAddTable() {
  const isFirstTable = schema.value.tables.length === 0
  const name = nextTableName(schema.value.tables, 'table')
  const offset = schema.value.tables.length * 36
  const table = createSchemaTable({
    name,
    position: isFirstTable
      ? { x: 120, y: 100 }
      : { x: 100 + offset, y: 80 + offset },
  })
  schema.value = {
    ...schema.value,
    tables: [...schema.value.tables, table],
  }
  onSelectTable(table.id)
  commit()

  // 首次落表时强制视口，避免 Vue Flow 仍停留在 zoom=1
  if (isFirstTable) {
    nextTick(() => {
      setViewport({ ...DEFAULT_VIEWPORT })
    })
  }
}

async function onClear() {
  const ok = await confirmAction({
    title: '清空画布',
    content: '将删除全部表与关联，是否继续？',
    confirmText: '清空',
  })
  if (!ok) return
  schema.value = createDatabaseSchema({
    name: schema.value.name,
    comment: schema.value.comment,
  })
  selection.value = null
  activeColumnId.value = null
  sidePanel.value = 'meta'
  commit()
  nextTick(() => {
    setViewport({ ...DEFAULT_VIEWPORT })
  })
}

function onUpdateTable(patch: Partial<Pick<SchemaTable, 'name' | 'comment'>>) {
  if (!activeTableId.value) return
  const next = {
    ...patch,
    ...(patch.name != null
      ? { name: clampIdentifier(patch.name, MAX_TABLE_NAME_LENGTH) }
      : null),
  }
  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) =>
      t.id === activeTableId.value ? { ...t, ...next } : t,
    ),
  }
  commit()
}

function onUpdateColumn(columnId: string, patch: Partial<SchemaColumn>) {
  if (!activeTableId.value) return
  const next = {
    ...patch,
    ...(patch.name != null
      ? { name: clampIdentifier(patch.name, MAX_COLUMN_NAME_LENGTH) }
      : null),
  }
  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) => {
      if (t.id !== activeTableId.value) return t
      let columns = t.columns.map((c) => (c.id === columnId ? { ...c, ...next } : c))
      if (next.primaryKey) {
        columns = columns.map((c) =>
          c.id === columnId
            ? { ...c, primaryKey: true, nullable: false }
            : { ...c, primaryKey: false },
        )
      }
      return { ...t, columns }
    }),
  }
  commit()
}

function onAddColumn() {
  if (!activeTableId.value) return
  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) => {
      if (t.id !== activeTableId.value) return t
      const col = createSchemaColumn({ name: nextColumnName(t.columns, 'column') })
      activeColumnId.value = col.id
      return { ...t, columns: [...t.columns, col] }
    }),
  }
  commit()
}

async function onRemoveColumn(columnId: string) {
  if (!activeTableId.value) return
  const used = schema.value.relations.some(
    (r) =>
      r.sourceColumnId === columnId ||
      r.targetColumnId === columnId ||
      r.junctionSourceColumnId === columnId ||
      r.junctionTargetColumnId === columnId,
  )
  if (used) {
    const ok = await confirmAction({
      title: '删除字段',
      content: '该字段已被关联使用，删除将同时移除相关关联，是否继续？',
      confirmText: '删除',
    })
    if (!ok) return
  }

  const tableId = activeTableId.value
  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) =>
      t.id === tableId
        ? { ...t, columns: t.columns.filter((c) => c.id !== columnId) }
        : t,
    ),
    relations: schema.value.relations.filter(
      (r) =>
        r.sourceColumnId !== columnId &&
        r.targetColumnId !== columnId &&
        r.junctionSourceColumnId !== columnId &&
        r.junctionTargetColumnId !== columnId,
    ),
  }
  if (activeColumnId.value === columnId) {
    activeColumnId.value = activeTable.value?.columns[0]?.id ?? null
  }
  commit()
}

async function onRemoveTable(tableId = activeTableId.value) {
  if (!tableId) return
  const table = schema.value.tables.find((t) => t.id === tableId)
  const ok = await confirmAction({
    title: '删除表',
    content: `确定删除表「${table?.name ?? ''}」及其相关关联吗？`,
    confirmText: '删除',
  })
  if (!ok) return

  const junctionIds = schema.value.relations
    .filter(
      (r) =>
        r.type === 'many-to-many' &&
        (r.sourceTableId === tableId || r.targetTableId === tableId) &&
        r.junctionTableId,
    )
    .map((r) => r.junctionTableId!)

  schema.value = {
    ...schema.value,
    tables: schema.value.tables.filter(
      (t) => t.id !== tableId && !junctionIds.includes(t.id),
    ),
    relations: schema.value.relations.filter(
      (r) =>
        r.sourceTableId !== tableId &&
        r.targetTableId !== tableId &&
        r.junctionTableId !== tableId &&
        !junctionIds.includes(r.junctionTableId ?? ''),
    ),
  }
  if (selection.value?.kind === 'table' && selection.value.tableId === tableId) {
    selection.value = null
    activeColumnId.value = null
  }
  commit()
}

function onUpdateRelation(patch: Partial<SchemaRelation>) {
  if (!activeRelationId.value) return
  schema.value = {
    ...schema.value,
    relations: schema.value.relations.map((r) =>
      r.id === activeRelationId.value ? { ...r, ...patch } : r,
    ),
  }
  commit()
}

async function removeRelation(rel: SchemaRelation, needConfirm: boolean) {
  if (needConfirm) {
    const ok = await confirmAction({
      title: '删除关联',
      content:
        rel.type === 'many-to-many'
          ? '删除多对多关联将同时删除自动生成的中间表，是否继续？'
          : '确定删除该关联吗？',
      confirmText: '删除',
    })
    if (!ok) return false
  }

  let tables = schema.value.tables
  if (rel.type === 'many-to-many' && rel.junctionTableId) {
    tables = tables.filter((t) => t.id !== rel.junctionTableId)
  }

  schema.value = {
    ...schema.value,
    tables,
    relations: schema.value.relations.filter((r) => r.id !== rel.id),
  }
  if (selection.value?.kind === 'relation' && selection.value.relationId === rel.id) {
    selection.value = null
    sidePanel.value = 'meta'
  }
  commit()
  return true
}

function onEdgesChange(changes: EdgeChange[]) {
  const removedIds = new Set<string>()
  for (const change of changes) {
    if (change.type !== 'remove') continue
    const rel = findRelationByEdgeId(schema.value.relations, change.id)
    if (rel) removedIds.add(rel.id)
  }
  if (!removedIds.size) return

  for (const relationId of removedIds) {
    const rel = schema.value.relations.find((r) => r.id === relationId)
    if (rel) void removeRelation(rel, false)
  }
}

function parseHandleColumnId(handleId?: string | null): string | null {
  if (!handleId) return null
  const m = handleId.match(/^(?:in|out)-(.+)$/)
  return m?.[1] ?? null
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return
  if (connection.source === connection.target) return

  const sourceTable = schema.value.tables.find((t) => t.id === connection.source)
  const targetTable = schema.value.tables.find((t) => t.id === connection.target)
  if (!sourceTable || !targetTable) return

  let sourceColumnId = parseHandleColumnId(connection.sourceHandle)
  let targetColumnId = parseHandleColumnId(connection.targetHandle)

  // 约定：连线起点为被引用侧（主键），终点为外键侧
  if (!sourceColumnId) {
    sourceColumnId = findPrimaryKeyColumn(sourceTable)?.id ?? null
  }
  if (!targetColumnId) {
    targetColumnId = findPrimaryKeyColumn(targetTable)?.id ?? null
  }
  if (!sourceColumnId || !targetColumnId) return

  relationDraft.sourceTable = sourceTable
  relationDraft.sourceColumnId = sourceColumnId
  relationDraft.targetTable = targetTable
  relationDraft.targetColumnId = targetColumnId
  relationDraft.visible = true
}

function onConfirmRelation(payload: {
  type: SchemaRelationType
  onDelete: SchemaReferentialAction
  onUpdate: SchemaReferentialAction
}) {
  const sourceTable = relationDraft.sourceTable
  const targetTable = relationDraft.targetTable
  const sourceColumnId = relationDraft.sourceColumnId
  const targetColumnId = relationDraft.targetColumnId
  if (!sourceTable || !targetTable || !sourceColumnId || !targetColumnId) return

  const sourceColumn = sourceTable.columns.find((c) => c.id === sourceColumnId)
  const targetColumn = targetTable.columns.find((c) => c.id === targetColumnId)
  if (!sourceColumn || !targetColumn) return

  if (payload.type === 'many-to-many') {
    const { junctionTable, relation } = createManyToManyArtifacts({
      sourceTable,
      targetTable,
      sourceColumn,
      targetColumn,
      existingTables: schema.value.tables,
    })
    relation.onDelete = payload.onDelete
    relation.onUpdate = payload.onUpdate

    schema.value = {
      ...schema.value,
      tables: [...schema.value.tables, junctionTable],
      relations: [...schema.value.relations, relation],
    }
    selection.value = { kind: 'relation', relationId: relation.id }
    sidePanel.value = 'relation'
    relationDraft.visible = false
    commit()
    return
  }

  // 1:1 / 1:N：source=被引用侧；若目标点在主键上则自动创建外键列，否则使用连线目标字段
  const targetIsPk = !!targetColumn.primaryKey
  let fkTable = targetTable
  let fkColumn = targetColumn

  if (targetIsPk) {
    const ensured = ensureFkColumn({
      table: targetTable,
      refTable: sourceTable,
      refColumn: sourceColumn,
      relationType: payload.type,
    })
    fkTable = ensured.table
    fkColumn = ensured.column
  } else {
    fkColumn = {
      ...targetColumn,
      indexed: true,
      unique: payload.type === 'one-to-one' ? true : targetColumn.unique,
    }
    fkTable = {
      ...targetTable,
      columns: targetTable.columns.map((c) => (c.id === fkColumn.id ? fkColumn : c)),
    }
  }

  const relation = createSchemaRelation({
    type: payload.type,
    sourceTableId: sourceTable.id,
    sourceColumnId: sourceColumn.id,
    targetTableId: fkTable.id,
    targetColumnId: fkColumn.id,
    onDelete: payload.onDelete,
    onUpdate: payload.onUpdate,
  })

  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) => (t.id === fkTable.id ? fkTable : t)),
    relations: [...schema.value.relations, relation],
  }
  selection.value = { kind: 'relation', relationId: relation.id }
  sidePanel.value = 'relation'
  relationDraft.visible = false
  commit()
}

function onNodeDragStop(event: NodeDragEvent) {
  const { node } = event
  schema.value = {
    ...schema.value,
    tables: schema.value.tables.map((t) =>
      t.id === node.id
        ? { ...t, position: { x: node.position.x, y: node.position.y } }
        : t,
    ),
  }
  commit()
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  const rel =
    findRelationByEdgeId(schema.value.relations, edge.id) ||
    (edge.data?.relationId
      ? schema.value.relations.find((r) => r.id === edge.data!.relationId)
      : undefined)
  if (!rel) return
  selection.value = { kind: 'relation', relationId: rel.id }
  sidePanel.value = 'relation'
}

async function onCopyJson() {
  const ok = await copySchemaJson(schema.value)
  if (!ok) {
    window.alert('复制失败，请检查浏览器剪贴板权限')
  }
}

function onExportJson() {
  downloadSchemaJson(schema.value)
}

defineExpose({
  getSchema: () => cloneSchema(schema.value),
  setSchema: (next: DatabaseSchema) => {
    schema.value = cloneSchema(next)
    selection.value = null
    commit()
  },
  exportJson: () => downloadSchemaJson(schema.value),
})
</script>

<style scoped>
.schema-rail {
  box-sizing: border-box;
  flex: 0 0 50px;
  width: 50px;
  min-width: 50px;
  height: 100%;
  padding: 5px;
  border-right: 1px solid var(--layout-border-color, var(--border-color));
  background: var(--component-background-color);
  overflow: visible;
  z-index: 20;
}

.schema-rail-item {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto 5px;
  border-radius: 4px;
  color: var(--text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}

.schema-rail-item:hover,
.schema-rail-item.is-active {
  color: var(--primary-color);
}

.schema-rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.schema-flow {
  --vf-node-bg: var(--component-background-color);
  --vf-node-text: var(--text-color);
  --vf-connection-path: var(--primary-color);
  --vf-handle: var(--primary-color);
  background: var(--layout-container-background-color);
}

.schema-flow :deep(.vue-flow__node-schema-table) {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: left;
}

.schema-flow :deep(.vue-flow__edge-text) {
  font-size: 11px;
  fill: var(--text-color-secondary);
}

.schema-flow :deep(.vue-flow__edge-textbg) {
  fill: var(--component-background-color);
}

.schema-flow :deep(.vue-flow__edge-path),
.schema-flow :deep(.vue-flow__connection-path) {
  stroke: var(--text-color-secondary);
}

.schema-flow :deep(.vue-flow__edge.selected .vue-flow__edge-path),
.schema-flow :deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke: var(--primary-color);
}

.schema-flow :deep(.vue-flow__arrowhead polyline),
.schema-flow :deep(.vue-flow__edge marker path) {
  fill: var(--text-color-secondary);
  stroke: var(--text-color-secondary);
}

.schema-flow :deep(.vue-flow__controls) {
  box-shadow: var(--card-shadow);
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--component-background-color);
}

.schema-flow :deep(.vue-flow__controls-button) {
  background: var(--component-background-color);
  border-bottom: 1px solid var(--layout-border-color);
  fill: var(--text-color);
  color: var(--text-color);
}

.schema-flow :deep(.vue-flow__controls-button:hover) {
  background: var(--header-action-hover-bg-color, color-mix(in srgb, var(--text-color) 8%, transparent));
}

.schema-flow :deep(.vue-flow__controls-button svg) {
  fill: currentColor;
}

.schema-flow :deep(.vue-flow__minimap) {
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--component-background-color) !important;
}

.schema-flow :deep(.vue-flow__attribution) {
  background: transparent;
  color: var(--text-color-secondary);
}

.schema-flow :deep(.vue-flow__attribution a) {
  color: var(--text-color-secondary);
}
</style>
