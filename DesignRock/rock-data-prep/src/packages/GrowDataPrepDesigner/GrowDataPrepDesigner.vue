<template>
  <div
    class="absolute inset-0 flex h-auto w-auto min-h-0 flex-col overflow-hidden bg-layout"
    tabindex="-1"
  >
    <div
      class="box-border flex h-10 w-full shrink-0 items-center justify-between gap-3 border-b border-solid border-border bg-component px-3"
      @click.stop
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <GrowInput
          v-model="dataset.name"
          size="small"
          class="!w-[180px]"
          placeholder="数据集名称"
        />
        <GrowButton
          size="small"
          type="primary"
          :disabled="!schemaList.length"
          @click="onAddTable"
        >
          <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
          添加表
        </GrowButton>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GrowButton
          size="small"
          :disabled="!dataset.dimensions.length && !dataset.measures.length"
          :loading="previewLoading"
          @click="onPreview"
        >
          <GrowIconify icon="carbon:data-view" :size="14" class="mr-1 align-[-2px]" />
          预览数据
        </GrowButton>
        <GrowButton class="!ml-0" size="small" type="primary" :loading="saving" @click="onSave">
          <GrowIconify icon="carbon:save" :size="14" class="mr-1 align-[-2px]" />
          保存
        </GrowButton>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <aside class="prep-rail" @click.stop>
        <GrowTooltip
          v-for="item in railItems"
          :key="item.type"
          :content="item.label"
          placement="right"
        >
          <div
            class="prep-rail-item"
            :class="{ 'is-active': sidePanel === item.type }"
            role="button"
            tabindex="0"
            :aria-label="item.label"
            @click="sidePanel = item.type"
            @keydown.enter.prevent="sidePanel = item.type"
            @keydown.space.prevent="sidePanel = item.type"
          >
            <GrowIconify :icon="item.icon" :size="18" class="prep-rail-icon" />
          </div>
        </GrowTooltip>
      </aside>

      <div
        v-if="sidePanel"
        class="relative z-20 w-[320px] shrink-0 overflow-hidden border-r border-solid border-border bg-component"
        @click.stop
      >
        <div
          class="box-border flex h-10 items-center justify-between gap-2 border-b border-solid border-border px-3"
        >
          <h4 class="m-0 text-[13px] font-semibold text-text">{{ sidePanelTitle }}</h4>
          <GrowButton text size="small" class="!px-1" @click="sidePanel = null">
            <GrowIconify icon="carbon:close" :size="15" />
          </GrowButton>
        </div>
        <div class="absolute bottom-0 left-0 right-0 top-10 overflow-auto">
          <FieldRolePanel
            v-if="sidePanel === 'fields'"
            :columns="activeColumns"
            :dimensions="dataset.dimensions"
            :measures="dataset.measures"
            @add-dimension="onAddDimension"
            @add-measure="onAddMeasure"
            @remove-dimension="onRemoveDimension"
            @remove-measure="onRemoveMeasure"
            @update-dimension="onUpdateDimension"
            @update-measure="onUpdateMeasure"
          />
          <JoinPanel
            v-else-if="sidePanel === 'joins'"
            :joins="dataset.joins"
            :sources="dataset.sources"
            @add="openCreateJoin()"
            @edit="openEditJoin"
            @remove="removeJoin"
          />
          <div v-else-if="sidePanel === 'meta'" class="px-3 py-3">
            <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="名称">
                <GrowInput v-model="dataset.name" size="small" />
              </GrowFormItem>
              <GrowFormItem label="说明">
                <GrowInput v-model="dataset.description" size="small" type="textarea" :rows="3" />
              </GrowFormItem>
            </GrowForm>
            <div
              class="mt-3 rounded border border-solid border-border bg-layout px-3 py-2 text-xs text-text-secondary"
            >
              <div>建模：{{ schemaRefLabels || '-' }}</div>
              <div class="mt-1">来源表：{{ dataset.sources.length }}</div>
              <div class="mt-1">Join：{{ dataset.joins.length }}</div>
              <div class="mt-1">维度：{{ dataset.dimensions.length }}</div>
              <div class="mt-1">度量：{{ dataset.measures.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative min-h-0 min-w-0 flex-1">
        <VueFlow
          id="grow-data-prep-designer"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-viewport="DEFAULT_VIEWPORT"
          :min-zoom="0.3"
          :max-zoom="1.4"
          :nodes-draggable="true"
          :edges-updatable="false"
          :nodes-connectable="true"
          elements-selectable
          class="h-full w-full"
          @node-drag-stop="onNodeDragStop"
          @connect="onConnect"
          @edge-click="onEdgeClick"
          @pane-click="selectedSourceId = null"
        >
          <Background :gap="16" pattern-color="var(--layout-border-color)" />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            :node-color="() => 'var(--primary-color)'"
            pannable
            zoomable
          />
        </VueFlow>

        <div
          v-if="!dataset.sources.length"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div class="rounded-lg bg-component/90 px-6 py-4 text-center text-sm text-text-secondary shadow">
            点击「添加表」，可从多个数据建模中选择表；多表请在「关联」中配置 Join
          </div>
        </div>

      </div>
    </div>

    <DataPreviewDrawer
      v-model:visible="previewVisible"
      :loading="previewLoading"
      :error="previewError"
      :result="previewResult"
      @close="previewVisible = false"
    />

    <JoinConfigDrawer
      v-model:visible="joinDrawer.visible"
      :mode="joinDrawer.mode"
      :sources="dataset.sources"
      :schemas-by-id="schemasById"
      :join="editingJoin"
      :preset="joinDrawer.preset"
      @confirm="onJoinConfirm"
      @remove="onJoinRemoveFromDrawer"
    />

    <GrowDrawer v-model="tablePickerVisible" title="添加表" size="480px">
      <div class="box-border flex h-full min-h-0 flex-col gap-2 px-1">
        <GrowInput
          v-model="tableSearchKeyword"
          size="small"
          clearable
          placeholder="搜索表名 / 注释"
        />

        <GrowTabs
          v-if="schemaTabGroups.length"
          v-model="activePickerSchemaId"
          size="small"
          class="prep-table-picker-tabs min-h-0 flex-1"
        >
          <GrowTabPane
            v-for="group in schemaTabGroups"
            :key="group.schemaId"
            :name="group.schemaId"
            :label="`${group.schemaName}（${group.tables.length}）`"
          >
            <div class="box-border flex h-full min-h-0 flex-col pt-2">
              <p
                v-if="group.schemaComment"
                class="mb-2 mt-0 truncate text-xs text-text-secondary"
                :title="group.schemaComment"
              >
                {{ group.schemaComment }}
              </p>
              <div
                v-if="pickerTablesOf(group.schemaId).length"
                class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto pb-1"
              >
                <div
                  v-for="row in pickerTablesOf(group.schemaId)"
                  :key="`${group.schemaId}:${row.id}`"
                  class="prep-table-picker-item"
                >
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm text-text">{{ row.name }}</div>
                    <div class="mt-0.5 truncate text-xs text-text-secondary">
                      {{ row.comment || '无注释' }}
                    </div>
                  </div>
                  <GrowButton
                    size="small"
                    type="primary"
                    @click="confirmAddTable(group.schemaId, row.id)"
                  >
                    添加
                  </GrowButton>
                </div>
              </div>
              <div v-else class="py-10 text-center text-xs text-text-secondary">
                {{
                  tableSearchKeyword.trim()
                    ? '无匹配的表'
                    : '该建模下的表已全部添加'
                }}
              </div>
            </div>
          </GrowTabPane>
        </GrowTabs>

        <div v-else class="py-10 text-center text-xs text-text-secondary">
          暂无可用建模
        </div>
      </div>
    </GrowDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, reactive, ref, watch } from 'vue'
import { defineComponent, h } from 'vue'
import {
  VueFlow,
  type Connection,
  type Edge,
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
import type { DataPrepDatabaseSchema, DataPrepSchemaTable } from './types'
import SourceTableNode from './components/SourceTableNode.vue'
import FieldRolePanel from './components/FieldRolePanel.vue'
import DataPreviewDrawer from './components/DataPreviewDrawer.vue'
import JoinPanel from './components/JoinPanel.vue'
import JoinConfigDrawer from './components/JoinConfigDrawer.vue'
import {
  createDataPrepDataset,
  createDataPrepDimension,
  createDataPrepJoin,
  createDataPrepMeasure,
  createDataPrepSource,
  ensureUniqueAlias,
  fieldKey,
  upsertSchemaRef,
} from './factories'
import { fetchDataPrepSchemaBundle, fetchDataPrepSchemas, queryDataPrepDataset, saveDataPrepDataset } from './api'
import type {
  DataPrepDataset,
  DataPrepDimension,
  DataPrepJoin,
  DataPrepJoinOnCondition,
  DataPrepJoinOnLogic,
  DataPrepJoinType,
  DataPrepMeasure,
  DataPrepSchemaBundle,
  DataPrepSchemaListItem,
  DatasetQueryResult,
} from './types'

defineOptions({
  name: 'GrowDataPrepDesigner',
})

const props = defineProps<{
  modelValue?: DataPrepDataset | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataPrepDataset]
  save: [value: DataPrepDataset]
}>()

const DEFAULT_VIEWPORT = { x: 40, y: 40, zoom: 1 }

const dataset = reactive<DataPrepDataset>(
  createDataPrepDataset({
    name: '销售区域汇总',
    schemaRefs: [],
  }),
)

const schemaList = ref<DataPrepSchemaListItem[]>([])
const schemaBundlesById = ref<Record<string, DataPrepSchemaBundle>>({})
const tableSearchKeyword = ref('')
const activePickerSchemaId = ref('')
const selectedSourceId = ref<string | null>(null)
const sidePanel = ref<'fields' | 'joins' | 'meta' | null>('fields')
const tablePickerVisible = ref(false)
const saving = ref(false)
const previewVisible = ref(false)
const previewLoading = ref(false)
const previewError = ref('')
const previewResult = ref<DatasetQueryResult | null>(null)

const joinDrawer = reactive<{
  visible: boolean
  mode: 'create' | 'edit'
  joinId: string | null
  preset: {
    leftSourceId?: string
    rightSourceId?: string
    leftField?: string
    rightField?: string
    type?: DataPrepJoinType
  } | null
}>({
  visible: false,
  mode: 'create',
  joinId: null,
  preset: null,
})

const railItems = [
  { type: 'fields' as const, label: '维度 / 度量', icon: 'carbon:list-boxes' },
  { type: 'joins' as const, label: '表关联', icon: 'carbon:connect' },
  { type: 'meta' as const, label: '数据集信息', icon: 'carbon:information' },
]

const sidePanelTitle = computed(() => {
  if (sidePanel.value === 'meta') return '数据集信息'
  if (sidePanel.value === 'joins') return '表关联'
  return '维度 / 度量'
})

const editingJoin = computed(
  () => dataset.joins.find((item) => item.id === joinDrawer.joinId) || null,
)

const schemaRefLabels = computed(() =>
  (dataset.schemaRefs || [])
    .map((item) => item.schemaName || item.schemaId)
    .filter(Boolean)
    .join('、'),
)

const schemasById = computed(() => {
  const map: Record<string, DataPrepDatabaseSchema> = {}
  for (const [id, bundle] of Object.entries(schemaBundlesById.value)) {
    map[id] = bundle.schema
  }
  return map
})

/** Tab：按建模分组，已添加的表不展示 */
const schemaTabGroups = computed(() =>
  schemaList.value.map((item) => {
    const bundle = schemaBundlesById.value[item.id]
    const tables = (bundle?.schema.tables || item.schema.tables || [])
      .filter(
        (t) =>
          !t.isJunction &&
          !dataset.sources.some((s) => s.schemaId === item.id && s.tableId === t.id),
      )
      .map((t) => ({
        id: t.id,
        name: t.name,
        comment: t.comment || '',
      }))
    return {
      schemaId: item.id,
      schemaName: item.schema.name,
      schemaComment: item.schema.comment || '',
      tables,
    }
  }),
)

const remainingAddableCount = computed(() =>
  schemaTabGroups.value.reduce((sum, group) => sum + group.tables.length, 0),
)

function pickerTablesOf(schemaId: string) {
  const group = schemaTabGroups.value.find((item) => item.schemaId === schemaId)
  if (!group) return []
  const keyword = tableSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return group.tables
  return group.tables.filter(
    (table) =>
      table.name.toLowerCase().includes(keyword) ||
      table.comment.toLowerCase().includes(keyword),
  )
}

watch(tableSearchKeyword, (keyword) => {
  if (!keyword.trim() || !tablePickerVisible.value) return
  // 搜索时自动跳到第一个有匹配结果的建模 Tab
  const hit = schemaTabGroups.value.find((group) => pickerTablesOf(group.schemaId).length > 0)
  if (hit) activePickerSchemaId.value = hit.schemaId
})

const activeSource = computed(() =>
  dataset.sources.find((s) => s.id === selectedSourceId.value) || dataset.sources[0] || null,
)

const activeColumns = computed(() => {
  if (!activeSource.value) return []
  const schema = schemasById.value[activeSource.value.schemaId]
  const table = schema?.tables.find((t) => t.id === activeSource.value!.tableId)
  return table?.columns || []
})

const dimensionFields = computed(() => new Set(dataset.dimensions.map((d) => d.field)))
const measureFields = computed(() => new Set(dataset.measures.map((m) => m.field)))

const SourceNodeView = defineComponent({
  name: 'DataPrepSourceNodeView',
  props: {
    id: { type: String, required: true },
    data: { type: Object, required: true },
  },
  setup(nodeProps) {
    return () =>
      h(SourceTableNode, {
        data: nodeProps.data,
        onSelect: (sourceId: string) => {
          selectedSourceId.value = sourceId
          sidePanel.value = 'fields'
        },
        onRemove: (sourceId: string) => onRemoveSource(sourceId),
        onSelectColumn: (sourceId: string, columnId: string) => {
          selectedSourceId.value = sourceId
          sidePanel.value = 'fields'
          void columnId
        },
        onToggleDimension: (sourceId: string, columnId: string) => {
          selectedSourceId.value = sourceId
          sidePanel.value = 'fields'
          toggleDimension(columnId)
        },
        onToggleMeasure: (sourceId: string, columnId: string) => {
          selectedSourceId.value = sourceId
          sidePanel.value = 'fields'
          toggleMeasure(columnId)
        },
      })
  },
})

const nodeTypes = {
  prepSource: markRaw(SourceNodeView),
}

const nodes = computed<Node[]>({
  get() {
    return dataset.sources.map((source) => {
      const bundle = schemaBundlesById.value[source.schemaId]
      const table = bundle?.schema.tables.find((t) => t.id === source.tableId)
      return {
        id: source.id,
        type: 'prepSource',
        position: { ...source.position },
        data: {
          source,
          schemaName: bundle?.schema.name || source.schemaId,
          columns: table?.columns || [],
          selected: selectedSourceId.value === source.id,
          dimensionFields: dimensionFields.value,
          measureFields: measureFields.value,
        },
        draggable: true,
        selectable: true,
      }
    })
  },
  set() {
    /* vue-flow 内部写入时忽略；位置在 drag-stop 同步 */
  },
})

const edges = computed<Edge[]>({
  get() {
    return dataset.joins.map((join) => ({
      id: join.id,
      source: join.leftSourceId,
      target: join.rightSourceId,
      label: formatJoinEdgeLabel(join),
      animated: false,
      selectable: true,
      style: { stroke: 'var(--primary-color)' },
    }))
  },
  set() {
    /* join 由面板 / 抽屉维护 */
  },
})

watch(
  () => props.modelValue?.id,
  () => {
    if (!props.modelValue) return
    Object.assign(dataset, createDataPrepDataset(props.modelValue))
  },
  { immediate: true },
)

watch(
  dataset,
  () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(dataset)) as DataPrepDataset)
  },
  { deep: true },
)

onMounted(async () => {
  try {
    schemaList.value = await fetchDataPrepSchemas()
    await Promise.all(schemaList.value.map((item) => ensureSchemaBundle(item.id)))
    // 保证已有来源对应的建模已加载
    await Promise.all(
      [...new Set(dataset.sources.map((s) => s.schemaId).filter(Boolean))].map((id) =>
        ensureSchemaBundle(id),
      ),
    )
    syncSchemaRefsFromSources()
  } catch (error) {
    console.error(error)
  }
})

async function ensureSchemaBundle(schemaId: string) {
  if (!schemaId || schemaBundlesById.value[schemaId]) return schemaBundlesById.value[schemaId]
  const bundle = await fetchDataPrepSchemaBundle(schemaId)
  schemaBundlesById.value = {
    ...schemaBundlesById.value,
    [bundle.id]: bundle,
  }
  return bundle
}

function syncSchemaRefsFromSources() {
  const usedIds = [...new Set(dataset.sources.map((s) => s.schemaId).filter(Boolean))]
  dataset.schemaRefs = usedIds.map((id) => ({
    schemaId: id,
    schemaName: schemaBundlesById.value[id]?.schema.name,
  }))
  dataset.schemaRef = dataset.schemaRefs[0]
}

function onAddTable() {
  if (!schemaList.value.length) return
  tableSearchKeyword.value = ''
  const preferred =
    schemaTabGroups.value.find((group) => group.tables.length > 0)?.schemaId ||
    schemaList.value[0]?.id ||
    ''
  activePickerSchemaId.value = preferred
  tablePickerVisible.value = true
}

async function confirmAddTable(schemaId: string, tableId: string) {
  if (!schemaId || !tableId) return
  await ensureSchemaBundle(schemaId)
  const schema = schemasById.value[schemaId]
  if (!schema) return
  if (dataset.sources.some((s) => s.schemaId === schemaId && s.tableId === tableId)) return

  const table = schema.tables.find((t) => t.id === tableId) as DataPrepSchemaTable | undefined
  if (!table) return

  const schemaName = schema.name
  const source = createDataPrepSource({
    schemaId,
    tableId: table.id,
    tableName: table.name,
    alias: ensureUniqueAlias(dataset.sources, table.name, schemaName),
    position: {
      x: 120 + dataset.sources.length * 300,
      y: 100 + (dataset.sources.length % 2) * 40,
    },
  })

  dataset.sources.push(source)
  dataset.schemaRefs = upsertSchemaRef(dataset.schemaRefs || [], {
    schemaId,
    schemaName,
  })
  dataset.schemaRef = dataset.schemaRefs[0]

  selectedSourceId.value = source.id
  // 多表时引导去配置关联，不再自动强加 Join
  sidePanel.value = dataset.sources.length > 1 ? 'joins' : 'fields'
  // 还有可添加表时保持抽屉打开，方便连续添加
  if (!remainingAddableCount.value) {
    tablePickerVisible.value = false
  } else if (!pickerTablesOf(activePickerSchemaId.value).length) {
    const next = schemaTabGroups.value.find((group) => group.tables.length > 0)
    if (next) activePickerSchemaId.value = next.schemaId
  }
}

function openCreateJoin(preset?: {
  leftSourceId?: string
  rightSourceId?: string
} | null) {
  joinDrawer.mode = 'create'
  joinDrawer.joinId = null
  joinDrawer.preset = preset || null
  joinDrawer.visible = true
}

function openEditJoin(joinId: string) {
  joinDrawer.mode = 'edit'
  joinDrawer.joinId = joinId
  joinDrawer.preset = null
  joinDrawer.visible = true
  sidePanel.value = 'joins'
}

function removeJoin(joinId: string) {
  dataset.joins = dataset.joins.filter((item) => item.id !== joinId)
  if (joinDrawer.joinId === joinId) {
    joinDrawer.visible = false
    joinDrawer.joinId = null
  }
}

function formatJoinEdgeLabel(join: DataPrepJoin) {
  const conditions = join.on || []
  if (!conditions.length) return join.type
  const logic = (join.onLogic || 'and') === 'or' ? '或' : '并'
  if (conditions.length === 1) {
    return `${join.type} · ${conditions[0].leftField}=${conditions[0].rightField}`
  }
  return `${join.type} · ${conditions.length}组条件(${logic})`
}

function applyJoinPayload(
  target: DataPrepJoin,
  payload: {
    leftSourceId: string
    rightSourceId: string
    type: DataPrepJoinType
    onLogic: DataPrepJoinOnLogic
    on: DataPrepJoinOnCondition[]
  },
) {
  target.leftSourceId = payload.leftSourceId
  target.rightSourceId = payload.rightSourceId
  target.type = payload.type
  target.onLogic = payload.onLogic
  target.on = payload.on
}

function onJoinConfirm(payload: {
  leftSourceId: string
  rightSourceId: string
  type: DataPrepJoinType
  onLogic: DataPrepJoinOnLogic
  on: DataPrepJoinOnCondition[]
}) {
  if (joinDrawer.mode === 'edit' && joinDrawer.joinId) {
    const target = dataset.joins.find((item) => item.id === joinDrawer.joinId)
    if (target) applyJoinPayload(target, payload)
  } else {
    // 避免同一对表重复多条（仍允许用户编辑已有）
    const duplicated = dataset.joins.find(
      (item) =>
        (item.leftSourceId === payload.leftSourceId &&
          item.rightSourceId === payload.rightSourceId) ||
        (item.leftSourceId === payload.rightSourceId &&
          item.rightSourceId === payload.leftSourceId),
    )
    if (duplicated) {
      applyJoinPayload(duplicated, payload)
    } else {
      dataset.joins.push(createDataPrepJoin(payload))
    }
  }
  joinDrawer.visible = false
  joinDrawer.joinId = null
  sidePanel.value = 'joins'
}

function onJoinRemoveFromDrawer() {
  if (joinDrawer.joinId) removeJoin(joinDrawer.joinId)
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target || connection.source === connection.target) return
  openCreateJoin({
    leftSourceId: connection.source,
    rightSourceId: connection.target,
  })
}

function onEdgeClick(event: EdgeMouseEvent) {
  const joinId = String(event.edge.id || '')
  if (!joinId) return
  openEditJoin(joinId)
}

function onRemoveSource(sourceId: string) {
  const source = dataset.sources.find((s) => s.id === sourceId)
  if (!source) return
  dataset.sources = dataset.sources.filter((s) => s.id !== sourceId)
  dataset.joins = dataset.joins.filter(
    (j) => j.leftSourceId !== sourceId && j.rightSourceId !== sourceId,
  )
  dataset.dimensions = dataset.dimensions.filter((d) => !d.field.startsWith(`${source.alias}.`))
  dataset.measures = dataset.measures.filter((m) => !m.field.startsWith(`${source.alias}.`))
  syncSchemaRefsFromSources()
  if (selectedSourceId.value === sourceId) selectedSourceId.value = null
}

function onNodeDragStop(event: NodeDragEvent) {
  const source = dataset.sources.find((s) => s.id === event.node.id)
  if (!source) return
  source.position = { ...event.node.position }
}

function findColumn(columnId: string) {
  if (!activeSource.value) return null
  const schema = schemasById.value[activeSource.value.schemaId]
  const table = schema?.tables.find((t) => t.id === activeSource.value!.tableId)
  return table?.columns.find((c) => c.id === columnId) || null
}

function onAddDimension(columnId: string) {
  const col = findColumn(columnId)
  if (!col || !activeSource.value) return
  const field = fieldKey(activeSource.value.alias, col.name)
  if (dataset.dimensions.some((d) => d.field === field)) return
  dataset.dimensions.push(
    createDataPrepDimension({
      name: col.comment || col.name,
      field,
      dataType: col.type,
    }),
  )
}

function onAddMeasure(columnId: string) {
  const col = findColumn(columnId)
  if (!col || !activeSource.value) return
  const field = fieldKey(activeSource.value.alias, col.name)
  if (dataset.measures.some((m) => m.field === field)) return
  const numeric = ['INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'TINYINT', 'SMALLINT'].includes(
    col.type,
  )
  dataset.measures.push(
    createDataPrepMeasure({
      name: col.comment || col.name,
      field,
      agg: numeric ? 'sum' : 'count',
    }),
  )
}

function toggleDimension(columnId: string) {
  const col = findColumn(columnId)
  if (!col || !activeSource.value) return
  const field = fieldKey(activeSource.value.alias, col.name)
  const existing = dataset.dimensions.find((d) => d.field === field)
  if (existing) {
    dataset.dimensions = dataset.dimensions.filter((d) => d.id !== existing.id)
    return
  }
  onAddDimension(columnId)
}

function toggleMeasure(columnId: string) {
  const col = findColumn(columnId)
  if (!col || !activeSource.value) return
  const field = fieldKey(activeSource.value.alias, col.name)
  const existing = dataset.measures.find((m) => m.field === field)
  if (existing) {
    dataset.measures = dataset.measures.filter((m) => m.id !== existing.id)
    return
  }
  onAddMeasure(columnId)
}

function onRemoveDimension(id: string) {
  dataset.dimensions = dataset.dimensions.filter((d) => d.id !== id)
}

function onRemoveMeasure(id: string) {
  dataset.measures = dataset.measures.filter((m) => m.id !== id)
}

function onUpdateDimension(id: string, patch: Partial<DataPrepDimension>) {
  const target = dataset.dimensions.find((d) => d.id === id)
  if (target) Object.assign(target, patch)
}

function onUpdateMeasure(id: string, patch: Partial<DataPrepMeasure>) {
  const target = dataset.measures.find((m) => m.id === id)
  if (target) Object.assign(target, patch)
}

async function onPreview() {
  previewVisible.value = true
  previewLoading.value = true
  previewError.value = ''
  try {
    previewResult.value = await queryDataPrepDataset({
      dataset: JSON.parse(JSON.stringify(dataset)) as DataPrepDataset,
      limit: 100,
    })
  } catch (error) {
    previewError.value = error instanceof Error ? error.message : '预览失败'
    previewResult.value = null
  } finally {
    previewLoading.value = false
  }
}

async function onSave() {
  saving.value = true
  try {
    const saved = await saveDataPrepDataset(
      JSON.parse(JSON.stringify(dataset)) as DataPrepDataset,
    )
    Object.assign(dataset, saved)
    emit('save', saved)
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.prep-rail {
  box-sizing: border-box;
  z-index: 20;
  display: flex;
  width: 50px;
  min-width: 50px;
  flex: 0 0 50px;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 5px;
  overflow: visible;
  border-right: 1px solid var(--layout-border-color, var(--border-color));
  background: var(--component-background-color);
}

.prep-rail-item {
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin: 0 auto 5px;
  border-radius: 4px;
  color: var(--text-color-secondary, var(--text-secondary-color));
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}

.prep-rail-item:last-child {
  margin-bottom: 0;
}

.prep-rail-item:hover,
.prep-rail-item.is-active {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}

.prep-rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.prep-rail-item :deep(.grow-iconify) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  line-height: 0;
  color: inherit;
}

.prep-rail-item :deep(.grow-iconify svg) {
  display: block;
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.prep-table-picker-tabs {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.prep-table-picker-tabs :deep(.el-tabs__header),
.prep-table-picker-tabs :deep(.n-tabs-nav),
.prep-table-picker-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.prep-table-picker-tabs :deep(.el-tabs__content),
.prep-table-picker-tabs :deep(.n-tab-pane),
.prep-table-picker-tabs :deep(.ant-tabs-content) {
  flex: 1;
  min-height: 0;
}

.prep-table-picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 8px;
  background: var(--component-background-color);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.prep-table-picker-item:hover {
  border-color: color-mix(in srgb, var(--primary-color) 45%, var(--layout-border-color, var(--border-color)));
  background: color-mix(in srgb, var(--primary-color) 4%, var(--component-background-color));
}
</style>
