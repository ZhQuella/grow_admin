<template>
  <aside
    class="clean-config box-border flex h-full min-h-0 w-[320px] shrink-0 flex-col border-l border-solid border-border bg-component"
  >
    <div
      class="box-border flex h-10 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
    >
      <h4 class="m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-text">
        {{ title }}
      </h4>
      <GrowButton v-if="node" text size="small" class="!px-1" title="关闭" @click="$emit('close')">
        <GrowIconify icon="carbon:close" :size="15" />
      </GrowButton>
    </div>

    <GrowScrollbar v-if="node" class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
          <GrowFormItem label="名称">
            <GrowInput
              :model-value="node.name"
              size="small"
              placeholder="节点名称"
              @update:model-value="(v) => patchNode({ name: String(v ?? '') })"
            />
          </GrowFormItem>
          <GrowFormItem label="类型">
            <GrowInput :model-value="typeLabel" size="small" disabled />
          </GrowFormItem>
        </GrowForm>

        <template v-if="node.type === 'table'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="来源">
              <GrowSelect
                :model-value="tableConfig.sourceKind"
                :options="TABLE_SOURCE_KIND_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="onSourceKindChange"
              />
            </GrowFormItem>
            <GrowFormItem label="数据表">
              <GrowSelect
                :model-value="tableConfig.refId || ''"
                :options="tableOptions"
                size="small"
                class="w-full"
                placeholder="选择数据表"
                @update:model-value="onTableRefChange"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            支持建模表、Dataset 原始表与 Dataset 输出；列表目前为 demo，后续对接真实接口。
          </p>
        </template>

        <template v-else-if="node.type === 'condition' || node.type === 'filter'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem v-if="conditionRules.length > 1" label="组合">
              <GrowSelect
                :model-value="conditionConfig.logic || 'and'"
                :options="FILTER_LOGIC_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ logic: String(v) as 'and' | 'or' })"
              />
            </GrowFormItem>
          </GrowForm>

          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">条件</span>
            <GrowButton size="small" @click="addConditionRule">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in conditionRules"
              :key="`cond-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-secondary">条件 {{ index + 1 }}</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="conditionRules.length <= 1"
                  @click="removeConditionRule(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="48px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="字段">
                  <GrowInput
                    :model-value="item.field"
                    size="small"
                    placeholder="字段名"
                    @update:model-value="(v) => updateConditionRule(index, { field: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem label="运算">
                  <GrowSelect
                    :model-value="item.op || 'eq'"
                    :options="FILTER_OP_OPTIONS"
                    size="small"
                    class="w-full"
                    @update:model-value="(v) => updateConditionRule(index, { op: String(v ?? 'eq') })"
                  />
                </GrowFormItem>
                <GrowFormItem
                  v-if="item.op !== 'empty' && item.op !== 'not-empty'"
                  label="值"
                >
                  <GrowInput
                    :model-value="item.value"
                    size="small"
                    placeholder="比较值"
                    @update:model-value="(v) => updateConditionRule(index, { value: String(v ?? '') })"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>

          <p class="mt-2 mb-0 text-xs text-text-secondary">
            <template v-if="node.type === 'condition'">
              满足条件的数据从右侧「是」出口流出，否则从「否」出口流出；两路均可继续连接下游。
            </template>
            <template v-else>
              仅保留满足条件的行，不满足的行会被丢弃。
            </template>
          </p>
        </template>

        <template v-else-if="node.type === 'split-field'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="源字段">
              <GrowInput
                :model-value="splitConfig.field || ''"
                size="small"
                placeholder="如 full_name / address"
                @update:model-value="(v) => patchConfig({ field: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="拆分方式">
              <GrowSelect
                :model-value="splitConfig.mode || 'delimiter'"
                :options="SPLIT_MODE_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="onSplitModeChange"
              />
            </GrowFormItem>
            <GrowFormItem v-if="(splitConfig.mode || 'delimiter') === 'delimiter'" label="分隔符">
              <GrowInput
                :model-value="splitConfig.delimiter ?? ','"
                size="small"
                placeholder=","
                @update:model-value="(v) => patchConfig({ delimiter: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem v-else-if="splitConfig.mode === 'regex'" label="正则">
              <GrowInput
                :model-value="splitConfig.pattern || ''"
                size="small"
                placeholder="^(\\d{4})-(\\d{2})-(\\d{2})$"
                @update:model-value="(v) => patchConfig({ pattern: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="保留原字段">
              <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                <GrowCheckbox
                  :model-value="splitConfig.keepOriginal !== false"
                  @update:model-value="(v) => patchConfig({ keepOriginal: !!v })"
                />
                拆分后保留源字段
              </label>
            </GrowFormItem>
            <GrowFormItem label="不足补空">
              <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                <GrowCheckbox
                  :model-value="splitConfig.padEmpty !== false"
                  @update:model-value="(v) => patchConfig({ padEmpty: !!v })"
                />
                段数不够时用空值补齐
              </label>
            </GrowFormItem>
          </GrowForm>

          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">输出字段</span>
            <GrowButton size="small" @click="addSplitOutput">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in splitOutputs"
              :key="`split-out-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-secondary">第 {{ index + 1 }} 段</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="splitOutputs.length <= 1"
                  @click="removeSplitOutput(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="56px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="字段名">
                  <GrowInput
                    :model-value="item.name"
                    size="small"
                    placeholder="field_n"
                    @update:model-value="(v) => updateSplitOutput(index, { name: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem v-if="splitConfig.mode === 'fixed-width'" label="宽度">
                  <GrowInput
                    :model-value="item.width != null ? String(item.width) : ''"
                    size="small"
                    placeholder="字符数"
                    @update:model-value="(v) => onSplitWidthChange(index, v)"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>

          <p class="mt-2 mb-0 text-xs text-text-secondary">
            例：`张三,李四` 按逗号拆成 `first_name` / `last_name`；日期可用正则捕获年/月/日。
          </p>
        </template>

        <template v-else-if="node.type === 'output'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="输出名">
              <GrowInput
                :model-value="outputConfig.outputName || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ outputName: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="目标">
              <GrowSelect
                :model-value="outputConfig.target || 'report'"
                :options="OUTPUT_TARGET_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ target: String(v) as any })"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            调用时执行：下游报表/页面拉数时按流定义实时跑。消费者绑定后续对接。
          </p>
        </template>

        <template v-else>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            「{{ typeLabel }}」详细配置将在后续版本完善。当前可编排连线并预览占位数据。
          </p>
        </template>

        <div class="mt-4 rounded border border-solid border-border px-2.5 py-2 text-xs text-text-secondary">
          <div>输入行数：{{ formatRows(node.stats?.inputRows) }}</div>
          <div class="mt-1">输出行数：{{ formatRows(node.stats?.outputRows) }}</div>
        </div>
      </div>
    </GrowScrollbar>

    <div v-else class="flex flex-1 items-center justify-center px-4 text-center text-xs text-text-secondary">
      选中画布节点以编辑配置
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DEMO_SOURCE_OPTIONS,
  FILTER_LOGIC_OPTIONS,
  FILTER_OP_OPTIONS,
  NODE_TYPE_META,
  SPLIT_MODE_OPTIONS,
  TABLE_SOURCE_KIND_OPTIONS,
} from '../../static/nodeCatalog'
import type {
  CleanConditionConfig,
  CleanFilterCondition,
  CleanFilterConfig,
  CleanFlowNode,
  CleanOutputConfig,
  CleanSplitFieldConfig,
  CleanSplitMode,
  CleanSplitOutputField,
  CleanTableSourceConfig,
  CleanTableSourceKind,
} from '../../types'

defineOptions({
  name: 'CleanNodeConfigPanel',
})

const props = defineProps<{
  node: CleanFlowNode | null
}>()

const emit = defineEmits<{
  close: []
  'update-node': [id: string, patch: Partial<CleanFlowNode>]
}>()

const OUTPUT_TARGET_OPTIONS = [
  { label: '报表数据集', value: 'report' },
  { label: '低代码页面数据源', value: 'lowcode' },
  { label: 'API 端点', value: 'api' },
]

const title = computed(() => (props.node ? `配置 · ${props.node.name}` : '节点配置'))
const typeLabel = computed(() =>
  props.node ? NODE_TYPE_META[props.node.type].label : '',
)

const tableConfig = computed(
  () => (props.node?.config || {}) as CleanTableSourceConfig,
)
const outputConfig = computed(
  () => (props.node?.config || {}) as CleanOutputConfig,
)
const splitConfig = computed(
  () => (props.node?.config || {}) as CleanSplitFieldConfig,
)
const splitOutputs = computed<CleanSplitOutputField[]>(() =>
  splitConfig.value.outputs?.length
    ? splitConfig.value.outputs
    : [{ name: 'field_1' }, { name: 'field_2' }],
)

const conditionConfig = computed(() => {
  const raw = (props.node?.config || {}) as CleanConditionConfig | CleanFilterConfig
  return {
    logic: raw.logic || 'and',
    conditions: raw.conditions || [],
  }
})

const conditionRules = computed<CleanFilterCondition[]>(() =>
  conditionConfig.value.conditions?.length
    ? conditionConfig.value.conditions
    : [{ field: '', op: 'eq', value: '' }],
)

const tableOptions = computed(() => {
  const kind = (tableConfig.value.sourceKind || 'schema-table') as CleanTableSourceKind
  return (DEMO_SOURCE_OPTIONS[kind] || []).map((item) => ({
    label: item.label,
    value: item.id,
  }))
})

function formatRows(value?: number | null) {
  return value == null ? '-' : String(value)
}

function patchNode(patch: Partial<CleanFlowNode>) {
  if (!props.node) return
  emit('update-node', props.node.id, patch)
}

function patchConfig(patch: Record<string, unknown>) {
  if (!props.node) return
  emit('update-node', props.node.id, {
    config: { ...props.node.config, ...patch } as CleanFlowNode['config'],
  })
}

function onSourceKindChange(value: string | number | null) {
  const sourceKind = String(value) as CleanTableSourceKind
  patchConfig({
    sourceKind,
    refId: '',
    refLabel: '',
    tableId: '',
    tableName: '',
  })
}

function onTableRefChange(value: string | number | null) {
  const refId = String(value ?? '')
  const kind = (tableConfig.value.sourceKind || 'schema-table') as CleanTableSourceKind
  const hit = (DEMO_SOURCE_OPTIONS[kind] || []).find((item) => item.id === refId)
  patchConfig({
    refId,
    refLabel: hit?.label || '',
    tableId: hit?.id || '',
    tableName: hit?.tableName || '',
  })
}

function onSplitModeChange(value: string | number | null) {
  const mode = String(value) as CleanSplitMode
  patchConfig({ mode })
}

function addSplitOutput() {
  const next = [...splitOutputs.value, { name: `field_${splitOutputs.value.length + 1}` }]
  patchConfig({ outputs: next })
}

function removeSplitOutput(index: number) {
  if (splitOutputs.value.length <= 1) return
  const next = splitOutputs.value.filter((_, i) => i !== index)
  patchConfig({ outputs: next })
}

function updateSplitOutput(index: number, patch: Partial<CleanSplitOutputField>) {
  const next = splitOutputs.value.map((item, i) => (i === index ? { ...item, ...patch } : item))
  patchConfig({ outputs: next })
}

function onSplitWidthChange(index: number, value: string | number | null) {
  const raw = String(value ?? '').trim()
  const width = raw === '' ? undefined : Number(raw)
  updateSplitOutput(index, {
    width: width != null && Number.isFinite(width) && width > 0 ? width : undefined,
  })
}

function addConditionRule() {
  patchConfig({
    conditions: [...conditionRules.value, { field: '', op: 'eq', value: '' }],
  })
}

function removeConditionRule(index: number) {
  if (conditionRules.value.length <= 1) return
  const next = conditionRules.value.filter((_, i) => i !== index)
  patchConfig({
    conditions: next,
    logic: next.length > 1 ? conditionConfig.value.logic || 'and' : 'and',
  })
}

function updateConditionRule(index: number, patch: Partial<CleanFilterCondition>) {
  const next = conditionRules.value.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  )
  patchConfig({ conditions: next })
}
</script>
