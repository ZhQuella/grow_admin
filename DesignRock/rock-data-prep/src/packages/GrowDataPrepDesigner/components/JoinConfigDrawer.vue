<template>
  <GrowDrawer
    :model-value="visible"
    :title="mode === 'edit' ? '编辑关联' : '添加关联'"
    class="data-prep-join-drawer"
    direction="rtl"
    size="440px"
    :destroy-on-close="true"
    @update:model-value="onVisible"
  >
    <div class="box-border flex h-full min-h-0 flex-col">
      <GrowScrollbar class="min-h-0 flex-1">
        <div class="box-border px-3 py-3">
          <p class="mb-3 mt-0 text-xs text-text-secondary">
            自行选择左右表与关联字段，支持多组字段；多组时可指定「并 / 或」。
          </p>

          <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
            <GrowFormItem label="左表">
              <GrowSelect
                v-model="form.leftSourceId"
                :options="sourceOptions"
                size="small"
                class="w-full"
                placeholder="选择左表"
              />
            </GrowFormItem>
            <GrowFormItem label="右表">
              <GrowSelect
                v-model="form.rightSourceId"
                :options="rightSourceOptions"
                size="small"
                class="w-full"
                placeholder="选择右表"
              />
            </GrowFormItem>
            <GrowFormItem label="Join 类型">
              <GrowSelect
                v-model="form.type"
                :options="JOIN_TYPE_OPTIONS"
                size="small"
                class="w-full"
              />
            </GrowFormItem>
            <GrowFormItem v-if="form.on.length > 1" label="条件关系">
              <GrowRadioButtonGroup
                v-model="form.onLogic"
                size="small"
                :options="ON_LOGIC_OPTIONS"
              />
            </GrowFormItem>
          </GrowForm>

          <div class="mt-1 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">关联字段</span>
            <GrowButton
              size="small"
              :disabled="!form.leftSourceId || !form.rightSourceId"
              @click="addCondition"
            >
              <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
              添加字段
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(cond, index) in form.on"
              :key="`cond-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-secondary">条件 {{ index + 1 }}</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="form.on.length <= 1"
                  @click="removeCondition(index)"
                >
                  删除
                </GrowButton>
              </div>
              <div class="flex flex-col gap-2">
                <GrowSelect
                  v-model="cond.leftField"
                  :options="leftFieldOptions"
                  size="small"
                  class="w-full"
                  placeholder="左表字段"
                  :disabled="!form.leftSourceId"
                />
                <div class="text-center text-[11px] text-text-secondary">=</div>
                <GrowSelect
                  v-model="cond.rightField"
                  :options="rightFieldOptions"
                  size="small"
                  class="w-full"
                  placeholder="右表字段"
                  :disabled="!form.rightSourceId"
                />
              </div>
            </div>
          </div>
        </div>
      </GrowScrollbar>

      <div
        class="flex shrink-0 items-center justify-end gap-2 border-t border-solid border-border px-3 py-3"
      >
        <GrowButton v-if="mode === 'edit'" size="small" type="danger" @click="emit('remove')">
          删除关联
        </GrowButton>
        <GrowButton size="small" @click="onVisible(false)">取消</GrowButton>
        <GrowButton size="small" type="primary" :disabled="!canConfirm" @click="onConfirm">
          确定
        </GrowButton>
      </div>
    </div>
  </GrowDrawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type {
  DataPrepDatabaseSchema,
  DataPrepJoin,
  DataPrepJoinOnCondition,
  DataPrepJoinOnLogic,
  DataPrepJoinType,
  DataPrepSource,
} from '../types'

defineOptions({
  name: 'DataPrepJoinConfigDrawer',
})

const JOIN_TYPE_OPTIONS: Array<{ label: string; value: DataPrepJoinType }> = [
  { label: 'INNER', value: 'inner' },
  { label: 'LEFT', value: 'left' },
  { label: 'RIGHT', value: 'right' },
]

const ON_LOGIC_OPTIONS: Array<{ label: string; value: DataPrepJoinOnLogic }> = [
  { label: '并', value: 'and' },
  { label: '或', value: 'or' },
]

const props = defineProps<{
  visible: boolean
  mode?: 'create' | 'edit'
  sources: DataPrepSource[]
  schemasById: Record<string, DataPrepDatabaseSchema>
  join?: DataPrepJoin | null
  preset?: {
    leftSourceId?: string
    rightSourceId?: string
    leftField?: string
    rightField?: string
    type?: DataPrepJoinType
  } | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [
    payload: {
      leftSourceId: string
      rightSourceId: string
      type: DataPrepJoinType
      onLogic: DataPrepJoinOnLogic
      on: DataPrepJoinOnCondition[]
    },
  ]
  remove: []
}>()

const form = reactive({
  leftSourceId: '',
  rightSourceId: '',
  type: 'inner' as DataPrepJoinType,
  onLogic: 'and' as DataPrepJoinOnLogic,
  on: [{ leftField: '', rightField: '' }] as DataPrepJoinOnCondition[],
})

const mode = computed(() => props.mode || 'create')

const sourceOptions = computed(() =>
  props.sources.map((s) => ({
    label: `${s.alias}（${s.tableName}）`,
    value: s.id,
  })),
)

const rightSourceOptions = computed(() =>
  sourceOptions.value.filter((item) => item.value !== form.leftSourceId),
)

function fieldOptionsOf(sourceId: string) {
  const source = props.sources.find((s) => s.id === sourceId)
  if (!source) return []
  const table = props.schemasById[source.schemaId]?.tables.find((t) => t.id === source.tableId)
  return (table?.columns || []).map((col) => ({
    label: `${col.name}${col.comment ? ` · ${col.comment}` : ''}`,
    value: col.name,
  }))
}

const leftFieldOptions = computed(() => fieldOptionsOf(form.leftSourceId))
const rightFieldOptions = computed(() => fieldOptionsOf(form.rightSourceId))

const canConfirm = computed(
  () =>
    !!form.leftSourceId &&
    !!form.rightSourceId &&
    form.leftSourceId !== form.rightSourceId &&
    form.on.length > 0 &&
    form.on.every((cond) => !!cond.leftField && !!cond.rightField),
)

function resetConditions(seed?: DataPrepJoinOnCondition[]) {
  form.on = seed?.length
    ? seed.map((item) => ({ leftField: item.leftField, rightField: item.rightField }))
    : [{ leftField: '', rightField: '' }]
}

function addCondition() {
  form.on.push({ leftField: '', rightField: '' })
}

function removeCondition(index: number) {
  if (form.on.length <= 1) return
  form.on.splice(index, 1)
  if (form.on.length === 1) form.onLogic = 'and'
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    if (props.mode === 'edit' && props.join) {
      form.leftSourceId = props.join.leftSourceId
      form.rightSourceId = props.join.rightSourceId
      form.type = props.join.type
      form.onLogic = props.join.onLogic || 'and'
      resetConditions(props.join.on)
      return
    }
    form.leftSourceId = props.preset?.leftSourceId || props.sources[0]?.id || ''
    form.rightSourceId =
      props.preset?.rightSourceId ||
      props.sources.find((s) => s.id !== form.leftSourceId)?.id ||
      ''
    form.type = props.preset?.type || 'inner'
    form.onLogic = 'and'
    resetConditions(
      props.preset?.leftField || props.preset?.rightField
        ? [
            {
              leftField: props.preset?.leftField || '',
              rightField: props.preset?.rightField || '',
            },
          ]
        : undefined,
    )
  },
)

watch(
  () => form.leftSourceId,
  () => {
    for (const cond of form.on) {
      if (!leftFieldOptions.value.some((item) => item.value === cond.leftField)) {
        cond.leftField = ''
      }
    }
    if (form.rightSourceId === form.leftSourceId) {
      form.rightSourceId = ''
      for (const cond of form.on) cond.rightField = ''
    }
  },
)

watch(
  () => form.rightSourceId,
  () => {
    for (const cond of form.on) {
      if (!rightFieldOptions.value.some((item) => item.value === cond.rightField)) {
        cond.rightField = ''
      }
    }
  },
)

function onVisible(value: boolean) {
  emit('update:visible', value)
}

function onConfirm() {
  if (!canConfirm.value) return
  emit('confirm', {
    leftSourceId: form.leftSourceId,
    rightSourceId: form.rightSourceId,
    type: form.type,
    onLogic: form.on.length > 1 ? form.onLogic : 'and',
    on: form.on.map((cond) => ({
      leftField: cond.leftField,
      rightField: cond.rightField,
    })),
  })
}
</script>

<style>
/* Drawer 挂到 body，需非 scoped 才能锁住 body 高度 */
.data-prep-join-drawer.el-drawer,
.data-prep-join-drawer.n-drawer {
  display: flex;
  flex-direction: column;
}

.data-prep-join-drawer .el-drawer__body,
.data-prep-join-drawer .n-drawer-body-content-wrapper {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
