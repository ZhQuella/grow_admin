<template>
  <div class="box-border w-full">
    <GrowForm
      v-if="fields.length"
      label-width="120px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <template v-for="(field, index) in fields" :key="`${field.modelKey}-${index}`">
        <div
          v-if="field.eleType === 'ChartSectionTitle'"
          class="mb-1 mt-3 border-b border-solid border-border pb-1 text-xs font-medium text-text first:mt-0"
        >
          {{ field.name }}
        </div>
        <div
          v-else-if="field.eleType === 'ChartSeriesListEditor'"
          class="mb-2 mt-1 w-full"
        >
          <div class="mb-1.5 text-xs text-text-secondary">
            {{ field.name }}
            <span v-if="field.describe" class="ml-1 opacity-80">· {{ field.describe }}</span>
          </div>
          <ChartSeriesListEditor
            :model-value="getFieldValue(field.modelKey) || []"
            @update:model-value="(v) => onFieldChange(field.modelKey, v)"
          />
        </div>
        <div
          v-else-if="field.eleType === 'ChartRadarSeriesListEditor'"
          class="mb-2 mt-1 w-full"
        >
          <div class="mb-1.5 text-xs text-text-secondary">
            {{ field.name }}
            <span v-if="field.describe" class="ml-1 opacity-80">· {{ field.describe }}</span>
          </div>
          <ChartRadarSeriesListEditor
            :model-value="getFieldValue(field.modelKey) || []"
            @update:model-value="(v) => onFieldChange(field.modelKey, v)"
          />
        </div>
        <div
          v-else-if="field.eleType === 'ChartRadarIndicatorListEditor'"
          class="mb-2 mt-1 w-full"
        >
          <div class="mb-1.5 text-xs text-text-secondary">
            {{ field.name }}
            <span v-if="field.describe" class="ml-1 opacity-80">· {{ field.describe }}</span>
          </div>
          <ChartRadarIndicatorListEditor
            :model-value="getFieldValue(field.modelKey) || []"
            @update:model-value="(v) => onFieldChange(field.modelKey, v)"
          />
        </div>
        <div
          v-else-if="field.eleType === 'ChartColorListEditor'"
          class="mb-2 mt-1 w-full"
        >
          <div class="mb-1.5 text-xs text-text-secondary">
            {{ field.name }}
            <span v-if="field.describe" class="ml-1 opacity-80">· {{ field.describe }}</span>
          </div>
          <ChartColorListEditor
            :model-value="getFieldValue(field.modelKey) || []"
            @update:model-value="(v) => onFieldChange(field.modelKey, v)"
          />
        </div>
        <div
          v-else-if="field.eleType === 'ChartCodeEditor'"
          class="mb-2 mt-1 w-full"
        >
          <div class="mb-1.5 text-xs text-text-secondary">
            {{ field.name }}
            <span v-if="field.describe" class="ml-1 opacity-80">· {{ field.describe }}</span>
          </div>
          <div
            class="box-border h-[240px] w-full overflow-hidden rounded border border-solid border-border"
          >
            <GrowCodeEditor
              class="h-full"
              :model-value="stringifyValue(getFieldValue(field.modelKey))"
              :default-language="field.props?.defaultLanguage || 'json'"
              :language-switchable="field.props?.languageSwitchable === true"
              :options="field.props?.options"
              @update:model-value="(v) => onFieldChange(field.modelKey, v)"
            />
          </div>
        </div>
        <GrowFormItem v-else class="chart-option-item">
          <template #label>
            <span class="inline-flex items-center gap-1">
              {{ field.name }}
              <GrowTooltip v-if="field.describe" :content="field.describe" placement="left">
                <span class="inline-flex cursor-help text-text-secondary">
                  <GrowIconify icon="carbon:help" :size="13" />
                </span>
              </GrowTooltip>
            </span>
          </template>
          <GrowColorPicker
            v-if="field.eleType === 'ChartColorInput'"
            class="w-full"
            size="small"
            show-alpha
            :model-value="normalizeColorValue(getFieldValue(field.modelKey))"
            @update:model-value="(v) => onFieldChange(field.modelKey, v || '')"
          />
          <component
            v-else
            :is="field.eleType"
            v-bind="field.props || {}"
            class="w-full"
            size="small"
            :model-value="getFieldValue(field.modelKey)"
            @update:model-value="(v: any) => onFieldChange(field.modelKey, v)"
          />
        </GrowFormItem>
      </template>
    </GrowForm>
    <p v-else class="m-0 px-1 text-xs text-text-secondary">当前类型暂无配置项</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'
import {
  getByPath,
  getChartOptionFields,
  setByPath,
  type ReportChartConfig,
  type ReportChartType,
} from '../../GrowReportRenderer/chartConfig'
import ChartSeriesListEditor from './ChartSeriesListEditor.vue'
import ChartRadarSeriesListEditor from './ChartRadarSeriesListEditor.vue'
import ChartRadarIndicatorListEditor from './ChartRadarIndicatorListEditor.vue'
import ChartColorListEditor from './ChartColorListEditor.vue'

defineOptions({
  name: 'ChartOptionFields',
})

const props = defineProps<{
  chartType: ReportChartType
  modelValue: ReportChartConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReportChartConfig]
}>()

const fields = computed(() => getChartOptionFields(props.chartType))

const getFieldValue = (modelKey: string) => getByPath(props.modelValue, modelKey)

const stringifyValue = (value: unknown) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return String(value)
}

/** ColorPicker 取值：transparent 视为空，其余原样（支持 hex / rgba） */
const normalizeColorValue = (value: unknown) => {
  const raw = stringifyValue(value).trim()
  if (!raw || raw === 'transparent') return null
  return raw
}

const onFieldChange = (modelKey: string, value: unknown) => {
  emit('update:modelValue', setByPath(props.modelValue || {}, modelKey, value))
}
</script>

<style scoped>
.chart-option-item :deep(.el-form-item__content),
.chart-option-item :deep(.n-form-item-blank),
.chart-option-item :deep(.ant-form-item-control-input-content) {
  min-width: 0;
  flex: 1;
}
</style>
