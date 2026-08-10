<template>
  <GrowDialog
    :model-value="visible"
    title="公式编辑器"
    width="920px"
    append-to-body
    destroy-on-close
    class="data-prep-formula-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="box-border flex max-h-[70vh] min-h-[520px] flex-col gap-3">
      <div class="rounded border border-solid border-border bg-layout p-3">
        <FormulaChipInput
          ref="chipInputRef"
          :model-value="draft"
          :fields="chipFields"
          placeholder="点击左侧字段 / 函数插入，或直接输入公式"
          @update:model-value="onDraftUpdate"
        />
        <div class="mt-2 flex items-start justify-between gap-3">
          <p class="m-0 min-w-0 flex-1 text-xs leading-relaxed text-text-secondary">
            预览首行结果
            <span class="text-text">{{ previewLabel }}</span>
            :
            <span :class="previewIsError ? 'text-red-500' : 'text-text'">{{ previewDisplay }}</span>
          </p>
          <GrowButton type="primary" size="small" class="shrink-0" @click="onConfirm">确定</GrowButton>
        </div>
      </div>

      <div
        class="grid min-h-0 flex-1 grid-cols-[240px_1fr] overflow-hidden rounded border border-solid border-border"
      >
        <aside class="formula-side flex min-h-0 flex-col border-r border-solid border-border">
          <GrowScrollbar class="min-h-0 flex-1">
            <div class="formula-side__body">
              <section class="formula-side__section">
                <h5 class="formula-side__title">字段引用</h5>
                <div v-if="!fieldGroups.length" class="formula-side__empty">请先在画布添加表</div>
                <div v-for="group in fieldGroups" :key="group.label" class="formula-side__group">
                  <div v-if="fieldGroups.length > 1" class="formula-side__group-label" :title="group.label">
                    {{ group.label }}
                  </div>
                  <button
                    v-for="field in group.fields"
                    :key="field.field"
                    type="button"
                    class="formula-side__item"
                    :title="field.field"
                    @mousedown.prevent
                    @click="onInsertField(field.field)"
                  >
                    <span class="formula-side__item-text">{{ field.label }}</span>
                  </button>
                </div>
              </section>

              <section class="formula-side__section">
                <h5 class="formula-side__title">逻辑</h5>
                <button
                  v-for="fn in logicFunctions"
                  :key="fn.name"
                  type="button"
                  class="formula-side__item"
                  :class="{ 'is-active': activeFn === fn.name }"
                  :title="activeFn === fn.name ? '再次点击插入到公式' : '查看说明'"
                  @mousedown.prevent
                  @click="onPickFunction(fn.name)"
                >
                  <span class="formula-side__item-text">{{ fn.name }}()</span>
                </button>
              </section>

              <section class="formula-side__section">
                <h5 class="formula-side__title">聚合</h5>
                <button
                  v-for="fn in aggFunctions"
                  :key="fn.name"
                  type="button"
                  class="formula-side__item"
                  :class="{ 'is-active': activeFn === fn.name }"
                  :title="activeFn === fn.name ? '再次点击插入到公式' : '查看说明'"
                  @mousedown.prevent
                  @click="onPickFunction(fn.name)"
                >
                  <span class="formula-side__item-text">{{ fn.name }}()</span>
                </button>
              </section>
            </div>
          </GrowScrollbar>
        </aside>

        <div class="min-h-0 overflow-hidden bg-component">
          <GrowScrollbar class="h-full min-h-0">
            <div class="p-4">
              <div v-if="activeDoc" class="text-sm text-text">
                <div class="mb-2 flex items-center gap-2 text-[15px] font-semibold">
                  <span class="formula-fx">fx</span>
                  {{ activeDoc.name }}
                </div>
                <p class="m-0 mb-4 text-xs leading-relaxed text-text-secondary">
                  {{ activeDoc.description }}
                </p>
                <div class="mb-1.5 text-xs font-medium text-text">示例</div>
                <pre class="formula-example m-0 mb-4 overflow-auto">{{ activeDoc.example }}</pre>
                <div class="mb-1.5 text-xs font-medium text-text">说明</div>
                <ul class="m-0 list-disc py-0 pl-4 text-xs leading-relaxed text-text-secondary">
                  <li v-for="param in activeDoc.params" :key="param.name" class="mb-1.5">
                    <span class="text-text">{{ param.name }}</span>
                    ：{{ param.description }}
                  </li>
                  <li v-if="!activeDoc.params.length">无参数</li>
                </ul>
              </div>
              <div v-else class="flex min-h-[200px] items-center justify-center text-xs text-text-secondary">
                选择左侧函数查看说明（再次点击可插入）；点击字段插入引用
              </div>
            </div>
          </GrowScrollbar>
        </div>
      </div>
    </div>
    <template #footer>
      <span />
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  FORMULA_FUNCTION_DOCS,
  type FormulaFunctionDoc,
} from '../../utils/formulaEval'
import type { DataPrepDataset, DataPrepTableRowsMap } from '../../types'
import { previewMetricConfig } from '../../utils/queryDataset'
import FormulaChipInput from './FormulaChipInput.vue'

defineOptions({
  name: 'DataPrepFormulaEditorDialog',
})

export type FormulaFieldOption = {
  field: string
  label: string
  type?: string
  groupLabel?: string
}

const props = defineProps<{
  visible: boolean
  modelValue: string
  fieldOptions: FormulaFieldOption[]
  dimensionFields: string[]
  dataset: DataPrepDataset
  tableRows: DataPrepTableRowsMap
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: string]
  confirm: [value: string]
}>()

const draft = ref('')
const activeFn = ref('')
const chipInputRef = ref<InstanceType<typeof FormulaChipInput> | null>(null)

const chipFields = computed(() =>
  props.fieldOptions.map((item) => ({
    field: item.field,
    label: item.label,
  })),
)

function onDraftUpdate(value: string) {
  draft.value = value
}

function syncDraftFromChip() {
  const next = chipInputRef.value?.getFormula?.()
  if (typeof next === 'string') draft.value = next
}

const fieldGroups = computed(() => {
  const map = new Map<string, FormulaFieldOption[]>()
  for (const item of props.fieldOptions) {
    const key = item.groupLabel || '字段'
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return [...map.entries()].map(([label, fields]) => ({ label, fields }))
})

const logicFunctions = computed(() =>
  FORMULA_FUNCTION_DOCS.filter((item) => item.category === 'logic'),
)
const aggFunctions = computed(() =>
  FORMULA_FUNCTION_DOCS.filter((item) => item.category === 'agg'),
)

const activeDoc = computed<FormulaFunctionDoc | null>(
  () => FORMULA_FUNCTION_DOCS.find((item) => item.name === activeFn.value) || null,
)

const preview = computed(() => {
  const formula = draft.value.trim()
  if (!formula) {
    return {
      label: '-',
      value: null,
      emptyReason: 'empty-formula' as const,
      error: '',
      groups: [],
    }
  }
  try {
    const result = previewMetricConfig(props.dataset, props.tableRows || {}, {
      dimensionFields: (props.dimensionFields || []).filter(Boolean),
      measure: { name: '', formula: draft.value },
    })
    const groups = result.groups || []
    if (!groups.length || (result.value == null && !groups.some((g) => g.value != null))) {
      const hasSources = (props.dataset?.sources || []).length > 0
      const hasRows = Object.values(props.tableRows || {}).some((rows) => rows?.length)
      return {
        ...result,
        groups,
        emptyReason: (!hasSources
          ? 'no-source'
          : !hasRows
            ? 'no-rows'
            : 'empty-result') as 'no-source' | 'no-rows' | 'empty-result',
        error: '',
      }
    }
    return { ...result, groups, emptyReason: '' as const, error: '' }
  } catch (error) {
    return {
      label: '-',
      value: null,
      emptyReason: '' as const,
      error: error instanceof Error ? error.message : '计算失败',
      groups: [],
    }
  }
})

const previewLabel = computed(() => preview.value.label || '-')
const previewIsError = computed(() => Boolean(preview.value.error))
const previewDisplay = computed(() => {
  if (preview.value.error) return preview.value.error
  if (preview.value.emptyReason === 'empty-formula') return '请输入公式'
  if (preview.value.emptyReason === 'no-source') return '请先在画布添加表'
  if (preview.value.emptyReason === 'no-rows') return '暂无样例数据'
  if (preview.value.emptyReason === 'empty-result') return '无匹配数据'
  const value = preview.value.value
  if (value == null) return '-'
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, '')
  }
  return String(value)
})

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return
    draft.value = props.modelValue || ''
    activeFn.value = ''
    await nextTick()
    // destroy-on-close 时内容可能晚一拍挂载
    await nextTick()
    chipInputRef.value?.renderFromModel(draft.value)
    chipInputRef.value?.focus()
  },
)

function onVisibleChange(value: boolean) {
  emit('update:visible', value)
}

function onInsertField(field: string) {
  chipInputRef.value?.insertField(field)
  syncDraftFromChip()
}

function onPickFunction(name: string) {
  // 首次点击只切换说明，避免误插入 AND()/SUM() 导致预览公式被破坏
  if (activeFn.value !== name) {
    activeFn.value = name
    return
  }
  chipInputRef.value?.insertText(`${name}()`)
  syncDraftFromChip()
}

function onConfirm() {
  syncDraftFromChip()
  emit('update:modelValue', draft.value)
  emit('confirm', draft.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.formula-side__body {
  box-sizing: border-box;
  padding: 12px 8px 16px;
}

.formula-side__section + .formula-side__section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--layout-border-color, var(--border-color)) 70%, transparent);
}

.formula-side__title {
  margin: 0 8px 8px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.formula-side__group + .formula-side__group {
  margin-top: 8px;
}

.formula-side__group-label {
  margin: 0 8px 4px;
  overflow: hidden;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.formula-side__empty {
  padding: 12px 8px;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 12px;
}

.formula-side__item {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-height: 34px;
  align-items: center;
  margin: 0;
  padding: 7px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.formula-side__item:hover {
  background: color-mix(in srgb, var(--text-color) 6%, transparent);
}

.formula-side__item.is-active {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-weight: 600;
}

.formula-side__item-text {
  display: block;
  width: 100%;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.formula-fx {
  display: inline-flex;
  height: 22px;
  min-width: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
}

.formula-example {
  padding: 10px 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--text-color) 6%, var(--component-background-color));
  color: var(--text-color);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
