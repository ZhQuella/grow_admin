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
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GrowButton
          size="small"
          :disabled="!dataset.metricConfigs.length"
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
            :class="{
              'is-active': sidePanel === item.type,
              'is-disabled': item.type === 'tables' && !schemaList.length,
            }"
            role="button"
            tabindex="0"
            :aria-label="item.label"
            @click="onRailClick(item.type)"
            @keydown.enter.prevent="onRailClick(item.type)"
            @keydown.space.prevent="onRailClick(item.type)"
          >
            <GrowIconify :icon="item.icon" :size="18" class="prep-rail-icon" />
          </div>
        </GrowTooltip>
      </aside>

      <div
        v-if="sidePanel"
        class="relative z-20 w-[320px] shrink-0 overflow-visible border-r border-solid border-border bg-component"
        @click.stop
      >
        <div
          class="box-border flex h-10 items-center justify-between gap-2 border-b border-solid border-border px-3"
        >
          <h4 class="m-0 text-[13px] font-semibold text-text">{{ sidePanelTitle }}</h4>
          <GrowButton text size="small" class="!px-1" @click="onCloseSidePanel">
            <GrowIconify icon="carbon:close" :size="15" />
          </GrowButton>
        </div>
        <div class="absolute bottom-0 left-0 right-0 top-10 overflow-visible">
          <div
            v-if="sidePanel === 'tables'"
            class="box-border flex h-full min-h-0 flex-col gap-2 overflow-hidden px-2 py-2"
          >
            <GrowInput
              v-model="tableSearchKeyword"
              size="small"
              clearable
              placeholder="搜索表名 / 注释"
            />

            <GrowScrollbar v-if="filteredSchemaGroups.length" class="min-h-0 flex-1">
              <div class="flex flex-col gap-3 pb-1">
                <div v-for="group in filteredSchemaGroups" :key="group.schemaId">
                  <div class="mb-1.5 px-0.5">
                    <div class="truncate text-xs font-medium text-text">
                      {{ group.schemaName }}
                      <span class="font-normal text-text-secondary">（{{ group.tables.length }}）</span>
                    </div>
                    <div
                      v-if="group.schemaComment"
                      class="mt-0.5 truncate text-[11px] text-text-secondary"
                      :title="group.schemaComment"
                    >
                      {{ group.schemaComment }}
                    </div>
                  </div>

                  <div v-if="group.tables.length" class="flex flex-col gap-2">
                    <div
                      v-for="row in group.tables"
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
                  <div v-else class="px-0.5 py-2 text-xs text-text-secondary">
                    该建模下的表已全部添加
                  </div>
                </div>
              </div>
            </GrowScrollbar>

            <div v-else class="py-10 text-center text-xs text-text-secondary">
              {{
                !schemaTabGroups.length
                  ? '暂无可用建模'
                  : tableSearchKeyword.trim()
                    ? '无匹配的表'
                    : '暂无可用建模'
              }}
            </div>
          </div>
          <div
            v-else-if="sidePanel === 'fields'"
            class="relative flex h-full min-h-0 w-full flex-col overflow-visible"
          >
            <div
              class="flex h-10 shrink-0 items-center justify-end border-b border-solid border-border px-1"
            >
              <GrowButton type="primary" size="small" @click.stop="onOpenDataPrepConfig">
                <GrowIconify icon="carbon:add" :size="16" class="mr-1" />
                添加
              </GrowButton>
            </div>

            <GrowScrollbar class="min-h-0 flex-1">
              <div class="p-2">
                <div
                  v-if="!dataset.metricConfigs.length"
                  class="px-2 py-6 text-center text-xs text-text-secondary"
                >
                  暂无配置，点击右上角添加
                </div>
                <div
                  v-for="item in dataset.metricConfigs"
                  :key="item.id"
                  class="group mb-1.5 flex items-center gap-1 rounded px-1 py-2 hover:bg-layout"
                  :class="{ 'bg-primary/10': editingConfigId === item.id && dataPrepConfigVisible }"
                >
                  <div class="min-w-0 flex-1 px-1">
                    <p class="m-0 truncate text-sm font-medium text-text">
                      {{ item.measure.name || '未命名度量' }}
                    </p>
                    <p class="m-0 mt-0.5 truncate text-xs text-text-secondary">
                      维度 {{ item.dimensionFields.length }} 个
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <GrowButton text size="small" title="编辑" @click.stop="onEditMetricConfig(item.id)">
                      <GrowIconify icon="carbon:edit" :size="14" />
                    </GrowButton>
                    <GrowButton
                      text
                      size="small"
                      type="danger"
                      title="删除"
                      @click.stop="onRemoveMetricConfig(item.id)"
                    >
                      <GrowIconify icon="carbon:trash-can" :size="14" />
                    </GrowButton>
                  </div>
                </div>
              </div>
            </GrowScrollbar>

            <div
              v-if="dataPrepConfigVisible"
              class="absolute bottom-0 left-full top-0 z-20 flex w-[520px] flex-col border-l border-solid border-border bg-component shadow-card"
            >
              <div
                class="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
              >
                <h4 class="m-0 text-sm font-medium text-text">
                  {{ editingConfigId ? '编辑维度 / 度量' : '添加维度 / 度量' }}
                </h4>
                <div class="flex shrink-0 items-center gap-2">
                  <GrowButton type="primary" size="small" @click.stop="onSaveDataPrepConfig">
                    保存
                  </GrowButton>
                  <GrowButton type="primary" plain size="small" @click.stop="onCloseDataPrepConfig">
                    取消
                  </GrowButton>
                </div>
              </div>
              <div class="min-h-0 flex-1 overflow-hidden">
                <DataPrepConfigPanel
                  v-model="draftMetricConfig"
                  :field-options="metricFieldOptions"
                  :dataset="dataset"
                  :table-rows="previewTableRows"
                />
              </div>
            </div>
          </div>
          <div v-else-if="sidePanel === 'meta'" class="h-full min-h-0 overflow-auto px-3 py-3">
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
              <div class="mt-1">配置：{{ dataset.metricConfigs.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <VueFlow
          id="grow-data-prep-designer"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :edge-types="edgeTypes"
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
      </div>
    </div>

    <DataPreviewDrawer
      v-model:visible="previewVisible"
      :loading="previewLoading"
      :error="previewError"
      :result="previewResult"
      @close="previewVisible = false"
    />
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
import SourceTableNode from './components/canvas/SourceTableNode.vue'
import JoinEdge from './components/canvas/JoinEdge.vue'
import DataPrepConfigPanel from './components/config/DataPrepConfigPanel.vue'
import DataPreviewDrawer from './components/preview/DataPreviewDrawer.vue'
import JoinConfigDrawer from './components/canvas/JoinConfigDrawer.vue'
import {
  createDataPrepDataset,
  createDataPrepJoin,
  createDataPrepMetricConfig,
  createDataPrepSource,
  ensureUniqueAlias,
  ensureUniqueMeasureOutputKey,
  fieldKey,
  upsertSchemaRef,
} from './factories'
import { fetchDataPrepSchemaBundle, fetchDataPrepSchemas, queryDataPrepDataset, saveDataPrepDataset } from './utils/api'
import { mergeSchemaBundlesToRowsMap } from './utils/queryDataset'
import type {
  DataPrepDataset,
  DataPrepJoin,
  DataPrepJoinOnCondition,
  DataPrepJoinOnLogic,
  DataPrepJoinType,
  DataPrepMetricConfig,
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
const selectedSourceId = ref<string | null>(null)
const sidePanel = ref<'tables' | 'fields' | 'meta' | null>('fields')
const dataPrepConfigVisible = ref(false)
const editingConfigId = ref('')
const draftMetricConfig = ref<DataPrepMetricConfig>(createDataPrepMetricConfig())
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
  { type: 'tables' as const, label: '添加表', icon: 'carbon:add' },
  { type: 'fields' as const, label: '维度 / 度量', icon: 'carbon:list-boxes' },
  { type: 'meta' as const, label: '数据集信息', icon: 'carbon:information' },
]

const sidePanelTitle = computed(() => {
  if (sidePanel.value === 'tables') return '添加表'
  if (sidePanel.value === 'meta') return '数据集信息'
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

/** 分组列表：搜索时只展示有匹配表的建模组 */
const filteredSchemaGroups = computed(() => {
  const keyword = tableSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return schemaTabGroups.value
  return schemaTabGroups.value
    .map((group) => ({
      ...group,
      tables: group.tables.filter(
        (table) =>
          table.name.toLowerCase().includes(keyword) ||
          table.comment.toLowerCase().includes(keyword),
      ),
    }))
    .filter((group) => group.tables.length > 0)
})

const previewTableRows = computed(() =>
  mergeSchemaBundlesToRowsMap(Object.values(schemaBundlesById.value)),
)

const metricFieldOptions = computed(() => {
  const options: Array<{
    field: string
    label: string
    type?: string
    groupLabel?: string
  }> = []
  for (const source of dataset.sources) {
    const bundle = schemaBundlesById.value[source.schemaId]
    const table = bundle?.schema.tables.find((item) => item.id === source.tableId)
    const groupLabel = `${source.alias}（${source.tableName}）`
    for (const col of table?.columns || []) {
      options.push({
        field: fieldKey(source.alias, col.name),
        label: col.comment || col.name,
        type: col.type,
        groupLabel,
      })
    }
  }
  return options
})

function onOpenDataPrepConfig() {
  joinDrawer.visible = false
  editingConfigId.value = ''
  draftMetricConfig.value = createDataPrepMetricConfig()
  dataPrepConfigVisible.value = true
}

function onEditMetricConfig(id: string) {
  const target = dataset.metricConfigs.find((item) => item.id === id)
  if (!target) return
  joinDrawer.visible = false
  editingConfigId.value = id
  draftMetricConfig.value = createDataPrepMetricConfig(JSON.parse(JSON.stringify(target)))
  dataPrepConfigVisible.value = true
}

function onRemoveMetricConfig(id: string) {
  dataset.metricConfigs = dataset.metricConfigs.filter((item) => item.id !== id)
  if (editingConfigId.value === id) onCloseDataPrepConfig()
}

function onSaveDataPrepConfig() {
  const next = createDataPrepMetricConfig({
    ...draftMetricConfig.value,
    measure: {
      ...draftMetricConfig.value.measure,
      outputKey: ensureUniqueMeasureOutputKey(
        dataset.metricConfigs,
        draftMetricConfig.value.measure.outputKey ||
          draftMetricConfig.value.measure.name ||
          'value',
        editingConfigId.value || draftMetricConfig.value.id,
      ),
    },
  })
  if (!next.dimensionFields.length) return
  if (!next.measure.formula.trim()) return
  if (!next.measure.name.trim()) return

  const index = dataset.metricConfigs.findIndex((item) => item.id === next.id)
  if (index >= 0) dataset.metricConfigs.splice(index, 1, next)
  else dataset.metricConfigs.push(next)
  onCloseDataPrepConfig()
}

function onCloseDataPrepConfig() {
  dataPrepConfigVisible.value = false
  editingConfigId.value = ''
}

function prepareTablesPanel() {
  if (!schemaList.value.length) return false
  tableSearchKeyword.value = ''
  return true
}

function onCloseSidePanel() {
  sidePanel.value = null
  onCloseDataPrepConfig()
}

function onRailClick(type: 'tables' | 'fields' | 'meta') {
  if (type === 'tables' && !schemaList.value.length) return
  if (sidePanel.value === type) {
    onCloseSidePanel()
    return
  }
  if (type === 'tables' && !prepareTablesPanel()) return
  if (type !== 'fields') dataPrepConfigVisible.value = false
  sidePanel.value = type
}

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
        },
        onRemove: (sourceId: string) => onRemoveSource(sourceId),
        onSelectColumn: (sourceId: string, columnId: string) => {
          selectedSourceId.value = sourceId
          void columnId
        },
        onSetPrimary: (sourceId: string) => {
          void onSetPrimarySource(sourceId)
        },
      })
  },
})

const nodeTypes = {
  prepSource: markRaw(SourceNodeView),
}

const edgeTypes = {
  prepJoin: markRaw(JoinEdge),
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
        data: (() => {
          const primaryId = dataset.primarySourceId || dataset.sources[0]?.id
          const primary = dataset.sources.find((item) => item.id === primaryId)
          return {
            source,
            schemaName: bundle?.schema.name || source.schemaId,
            columns: table?.columns || [],
            selected: selectedSourceId.value === source.id,
            isPrimary: primaryId === source.id,
            primaryLabel: primary?.tableName || primary?.alias || '未命名',
          }
        })(),
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
      type: 'prepJoin',
      source: join.leftSourceId,
      target: join.rightSourceId,
      animated: false,
      selectable: true,
      style: { stroke: 'var(--primary-color)' },
      interactionWidth: 24,
      selected: joinDrawer.joinId === join.id && joinDrawer.visible,
      data: {
        joinId: join.id,
        label: formatJoinEdgeLabel(join),
        active: joinDrawer.joinId === join.id && joinDrawer.visible,
        onSelect: (joinId: string) => openEditJoin(joinId),
        onRemove: (joinId: string) => removeJoin(joinId),
      },
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
  // 第一张表默认主表
  if (!dataset.primarySourceId || dataset.sources.length === 1) {
    dataset.primarySourceId = source.id
  }

  selectedSourceId.value = source.id
}

function openCreateJoin(preset?: {
  leftSourceId?: string
  rightSourceId?: string
} | null) {
  dataPrepConfigVisible.value = false
  joinDrawer.mode = 'create'
  joinDrawer.joinId = null
  joinDrawer.preset = preset || null
  joinDrawer.visible = true
}

function openEditJoin(joinId: string) {
  dataPrepConfigVisible.value = false
  joinDrawer.mode = 'edit'
  joinDrawer.joinId = joinId
  joinDrawer.preset = null
  joinDrawer.visible = true
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

function onSetPrimarySource(sourceId: string) {
  if (!sourceId || dataset.primarySourceId === sourceId) return
  if (!dataset.sources.some((item) => item.id === sourceId)) return
  dataset.primarySourceId = sourceId
}

function onRemoveSource(sourceId: string) {
  const source = dataset.sources.find((s) => s.id === sourceId)
  if (!source) return
  dataset.sources = dataset.sources.filter((s) => s.id !== sourceId)
  dataset.joins = dataset.joins.filter(
    (j) => j.leftSourceId !== sourceId && j.rightSourceId !== sourceId,
  )
  dataset.metricConfigs = dataset.metricConfigs
    .map((config) => ({
      ...config,
      dimensionFields: config.dimensionFields.filter(
        (field) => !field.startsWith(`${source.alias}.`),
      ),
      measure: {
        ...config.measure,
        formula: config.measure.formula.replaceAll(`[${source.alias}.`, '[__removed__.'),
      },
    }))
    .filter((config) => config.dimensionFields.length > 0)
  // 公式仍引用已删表字段的配置一并移除
  dataset.metricConfigs = dataset.metricConfigs.filter(
    (config) => !config.measure.formula.includes('[__removed__.'),
  )
  if (dataset.primarySourceId === sourceId) {
    dataset.primarySourceId = dataset.sources[0]?.id
  }
  syncSchemaRefsFromSources()
  if (selectedSourceId.value === sourceId) selectedSourceId.value = null
}

function onNodeDragStop(event: NodeDragEvent) {
  const source = dataset.sources.find((s) => s.id === event.node.id)
  if (!source) return
  source.position = { ...event.node.position }
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

.prep-rail-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.4;
  pointer-events: none;
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
