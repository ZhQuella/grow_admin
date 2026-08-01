<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <span class="w-16 shrink-0 text-xs text-text-secondary">{{ label }}</span>
      <div
        class="report-bind-source min-w-0 flex-1"
        :class="{ 'is-bound': isCodeBound }"
      >
        <GrowInput
          class="report-bind-source__input"
          size="small"
          :clearable="!isCodeBound"
          :readonly="isCodeBound"
          :model-value="sourceDisplay"
          :placeholder="placeholder"
          @update:model-value="onSourceInput"
        />
        <GrowButton
          class="report-bind-source__bind"
          size="small"
          :type="isCodeBound ? 'primary' : 'default'"
          :title="isCodeBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
          @click="openCodeDialog"
        >
          <GrowIconify icon="carbon:function" :size="14" />
        </GrowButton>
      </div>
    </div>
    <p v-if="describe" class="m-0 pl-[4.5rem] text-[11px] text-text-secondary">
      {{ describe }}
    </p>

    <div
      v-if="variableOptions.length && !isCodeBound"
      class="flex flex-wrap gap-1 pl-[4.5rem]"
    >
      <button
        v-for="opt in variableOptions"
        :key="opt.value"
        type="button"
        class="rounded border border-solid border-border px-1.5 py-0.5 text-[11px] text-text-secondary hover:border-primary hover:text-primary"
        :title="opt.value"
        @click="onPickVariable(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <ReportBindCodeDialog
      v-model:visible="codeDialogVisible"
      :model-value="modelValue?.source || ''"
      :bound="isCodeBound"
      :variables="variableOptions"
      @confirm="onCodeConfirm"
      @remove="onCodeRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReportDataBindRef } from '../../GrowReportRenderer/dataBinding'
import ReportBindCodeDialog from './ReportBindCodeDialog.vue'

defineOptions({
  name: 'BindRefEditor',
})

const props = withDefaults(
  defineProps<{
    label: string
    describe?: string
    modelValue?: ReportDataBindRef | null
    variableOptions?: Array<{ label: string; value: string }>
    placeholder?: string
  }>(),
  {
    describe: '',
    modelValue: null,
    variableOptions: () => [],
    placeholder: '请输入或绑定变量',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ReportDataBindRef | undefined]
}>()

const codeDialogVisible = ref(false)

const isCodeBound = computed(() => (props.modelValue?.mode || 'bind') === 'code')
const sourceDisplay = computed(() => props.modelValue?.source || '')

const emitValue = (next: ReportDataBindRef | undefined) => {
  emit('update:modelValue', next)
}

const emitPatch = (patch: Partial<ReportDataBindRef>) => {
  const next: ReportDataBindRef = {
    mode: props.modelValue?.mode || 'bind',
    source: props.modelValue?.source || '',
    mapping: props.modelValue?.mapping,
    ...patch,
  }
  if (!String(next.source || '').trim()) {
    emitValue(undefined)
    return
  }
  emitValue(next)
}

const openCodeDialog = () => {
  codeDialogVisible.value = true
}

const onSourceInput = (value: string | null) => {
  if (isCodeBound.value) return
  const source = value == null ? '' : String(value)
  if (!source.trim()) {
    emitValue(undefined)
    return
  }
  emitPatch({ mode: 'bind', source })
}

const onCodeConfirm = (value: string) => {
  const next = String(value ?? '').trim()
  if (!next) {
    onCodeRemove()
    return
  }
  let source = next
  if (!/^\s*return\b/.test(source) && /^state\b/.test(source)) {
    source = `return ${source}`
  }
  emitPatch({ mode: 'code', source })
}

const onCodeRemove = () => {
  emitValue(undefined)
}

const onPickVariable = (expression: string) => {
  const expr = String(expression || '').trim()
  if (!expr) return
  emitPatch({ mode: 'bind', source: expr })
}
</script>

<style scoped>
.report-bind-source {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.report-bind-source__input {
  flex: 1;
  min-width: 0;
}

.report-bind-source.is-bound .report-bind-source__input {
  :deep(.el-input__wrapper),
  :deep(.n-input),
  :deep(.ant-input),
  :deep(input) {
    cursor: default;
    background: var(--layout-container-background-color, #f0f2f5);
  }
}

.report-bind-source__bind {
  flex-shrink: 0;
  padding: 0 8px;
}

.report-bind-source__bind :deep(.grow-iconify),
.report-bind-source__bind :deep(svg) {
  display: block;
  margin: auto;
  line-height: 0;
}
</style>
