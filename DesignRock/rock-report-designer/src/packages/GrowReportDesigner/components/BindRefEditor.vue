<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <span class="w-16 shrink-0 text-xs text-text-secondary">{{ label }}</span>
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="modeOptions"
        :model-value="mode"
        @update:model-value="onModeChange"
      />
    </div>
    <p v-if="describe" class="m-0 pl-[4.5rem] text-[11px] text-text-secondary">
      {{ describe }}
    </p>
    <div class="flex items-center gap-2">
      <span class="w-16 shrink-0 text-xs text-text-secondary">来源</span>
      <GrowInput
        class="min-w-0 flex-1"
        size="small"
        clearable
        list="report-bind-vars"
        :model-value="modelValue?.source || ''"
        placeholder="如 return state.sales"
        @update:model-value="(v) => emitPatch({ source: String(v ?? '') })"
      />
    </div>
    <div v-if="variableOptions.length" class="flex flex-wrap gap-1 pl-[4.5rem]">
      <button
        v-for="opt in variableOptions"
        :key="opt.value"
        type="button"
        class="rounded border border-solid border-border px-1.5 py-0.5 text-[11px] text-text-secondary hover:border-primary hover:text-primary"
        @click="emitPatch({ source: opt.value })"
      >
        {{ opt.label }}
      </button>
    </div>
    <template v-if="mode === 'map'">
      <div class="flex items-center gap-2">
        <span class="w-16 shrink-0 text-xs text-text-secondary">路径</span>
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="modelValue?.mapping?.path || ''"
          placeholder="如 list / data.rows"
          @update:model-value="(v) => emitMapping({ path: String(v ?? '') })"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="w-16 shrink-0 text-xs text-text-secondary">字段</span>
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="fieldsText"
          placeholder="如 name,value（逗号分隔）"
          @update:model-value="onFieldsChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReportDataBindRef } from '../../GrowReportRenderer/dataBinding'

defineOptions({
  name: 'BindRefEditor',
})

const props = withDefaults(
  defineProps<{
    label: string
    describe?: string
    modelValue?: ReportDataBindRef | null
    variableOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    describe: '',
    modelValue: null,
    variableOptions: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ReportDataBindRef | undefined]
}>()

const modeOptions = [
  { label: '直接绑定', value: 'bind' },
  { label: '字段映射', value: 'map' },
]

const mode = computed(() => props.modelValue?.mode || 'bind')

const fieldsText = computed(() => (props.modelValue?.mapping?.fields || []).join(','))

const emitPatch = (patch: Partial<ReportDataBindRef>) => {
  const next: ReportDataBindRef = {
    mode: mode.value,
    source: props.modelValue?.source || '',
    mapping: props.modelValue?.mapping,
    ...patch,
  }
  if (!String(next.source || '').trim() && next.mode === 'bind' && !next.mapping?.path) {
    emit('update:modelValue', undefined)
    return
  }
  emit('update:modelValue', next)
}

const onModeChange = (value: string) => {
  emitPatch({ mode: value === 'map' ? 'map' : 'bind' })
}

const emitMapping = (patch: Partial<NonNullable<ReportDataBindRef['mapping']>>) => {
  emitPatch({
    mapping: {
      ...(props.modelValue?.mapping || {}),
      ...patch,
    },
  })
}

const onFieldsChange = (value: unknown) => {
  const fields = String(value ?? '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
  emitMapping({ fields })
}
</script>
