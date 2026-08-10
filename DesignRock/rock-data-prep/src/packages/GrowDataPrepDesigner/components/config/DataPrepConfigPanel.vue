<template>
  <div class="box-border flex h-full min-h-0 flex-col">
    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <div class="mb-4">
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-text">维度</span>
            <GrowButton type="primary" size="small" @click="addDimension">
              <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
              添加
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(field, index) in form.dimensionFields"
              :key="`dim-${index}`"
              class="flex items-center gap-2"
            >
              <GrowSelect
                :model-value="field"
                :options="dimensionSelectOptions"
                size="small"
                class="min-w-0 flex-1"
                placeholder="请选择字段"
                filterable
                clearable
                @update:model-value="(v) => onDimensionChange(index, String(v ?? ''))"
              />
              <GrowButton text size="small" type="danger" title="删除" @click="removeDimension(index)">
                <GrowIconify icon="carbon:trash-can" :size="14" />
              </GrowButton>
            </div>
            <div v-if="!form.dimensionFields.length" class="text-xs text-text-secondary">
              点击「添加」选择维度字段
            </div>
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-text">度量</div>
          <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
            <GrowFormItem label="名称">
              <GrowInput v-model="form.measure.name" size="small" placeholder="请输入" />
            </GrowFormItem>
            <GrowFormItem label="输出 Key">
              <GrowInput v-model="form.measure.outputKey" size="small" placeholder="请输入" />
            </GrowFormItem>
            <GrowFormItem label="公式">
              <div
                class="prep-formula-trigger box-border min-h-[32px] w-full cursor-pointer rounded border border-solid border-border bg-component px-2 py-1.5 text-xs"
                @click="formulaVisible = true"
              >
                <template v-if="form.measure.formula">
                  <span
                    v-for="(part, idx) in formulaParts"
                    :key="`f-${idx}`"
                    :class="part.type === 'field' ? 'prep-formula-chip' : 'text-text'"
                  >
                    {{ part.text }}
                  </span>
                </template>
                <span v-else class="text-text-secondary">点击编辑公式</span>
              </div>
            </GrowFormItem>
          </GrowForm>
        </div>
      </div>
    </GrowScrollbar>

    <FormulaEditorDialog
      v-model:visible="formulaVisible"
      v-model="form.measure.formula"
      :field-options="fieldOptions"
      :dimension-fields="form.dimensionFields.filter(Boolean)"
      :dataset="dataset"
      :table-rows="tableRows"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ref } from 'vue'
import {
  createDataPrepMetricConfig,
  defaultMeasureOutputKey,
} from '../../model/factories'
import type { DataPrepDataset, DataPrepMetricConfig, DataPrepTableRowsMap } from '../../model/types'
import FormulaEditorDialog, { type FormulaFieldOption } from './FormulaEditorDialog.vue'

defineOptions({
  name: 'DataPrepConfigPanel',
})

const props = defineProps<{
  modelValue: DataPrepMetricConfig | null
  fieldOptions: FormulaFieldOption[]
  dataset: DataPrepDataset
  tableRows: DataPrepTableRowsMap
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataPrepMetricConfig]
}>()

const formulaVisible = ref(false)

const form = reactive({
  id: '',
  dimensionFields: [] as string[],
  measure: {
    name: '',
    outputKey: '',
    formula: '',
  },
})

const dimensionSelectOptions = computed(() => {
  // 扁平 options；若组件支持 group 可再升级
  return props.fieldOptions.map((item) => ({
    label: item.groupLabel ? `${item.groupLabel} / ${item.label}` : item.label,
    value: item.field,
  }))
})

const formulaParts = computed(() => {
  const raw = form.measure.formula || ''
  const parts: Array<{ type: 'text' | 'field'; text: string }> = []
  const re = /\[([^\]]+)\]/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(raw))) {
    if (match.index > last) {
      parts.push({ type: 'text', text: raw.slice(last, match.index) })
    }
    const field = match[1].trim()
    const option = props.fieldOptions.find((item) => item.field === field)
    parts.push({ type: 'field', text: option?.label || field })
    last = match.index + match[0].length
  }
  if (last < raw.length) parts.push({ type: 'text', text: raw.slice(last) })
  return parts
})

function syncFromModel(value: DataPrepMetricConfig | null) {
  const next = createDataPrepMetricConfig(value || {})
  form.id = next.id
  form.dimensionFields = [...next.dimensionFields]
  form.measure.name = next.measure.name
  form.measure.outputKey = next.measure.outputKey || ''
  form.measure.formula = next.measure.formula || ''
  if (!form.dimensionFields.length) form.dimensionFields.push('')
}

watch(
  () => props.modelValue?.id,
  () => syncFromModel(props.modelValue),
  { immediate: true },
)

watch(
  form,
  () => {
    emit(
      'update:modelValue',
      createDataPrepMetricConfig({
        id: form.id,
        dimensionFields: form.dimensionFields.filter(Boolean),
        measure: {
          name: form.measure.name,
          outputKey: form.measure.outputKey || defaultMeasureOutputKey(form.measure.name),
          formula: form.measure.formula,
        },
      }),
    )
  },
  { deep: true },
)

function addDimension() {
  form.dimensionFields.push('')
}

function removeDimension(index: number) {
  form.dimensionFields.splice(index, 1)
}

function onDimensionChange(index: number, value: string) {
  form.dimensionFields[index] = value
}
</script>

<style scoped>
.prep-formula-trigger:hover {
  border-color: color-mix(in srgb, var(--primary-color) 45%, var(--layout-border-color, var(--border-color)));
}

.prep-formula-chip {
  display: inline-flex;
  margin: 0 2px;
  padding: 0 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  line-height: 18px;
}
</style>
