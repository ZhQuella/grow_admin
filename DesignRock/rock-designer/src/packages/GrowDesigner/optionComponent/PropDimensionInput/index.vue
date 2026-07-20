<template>
  <div class="prop-dimension-input">
    <GrowInputNumber
      class="prop-dimension-input__number"
      size="small"
      :controls="false"
      :placeholder="placeholder"
      :model-value="numberValue"
      @update:model-value="onNumberChange"
    />
    <GrowSelect
      class="prop-dimension-input__unit"
      size="small"
      :options="unitOptions"
      :model-value="unitValue"
      @update:model-value="onUnitChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'PropDimensionInput' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    units?: Array<{ label: string; value: string }>
    defaultUnit?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    defaultUnit: 'px',
    placeholder: '请输入数值',
    units: () => [
      { label: 'px', value: 'px' },
      { label: '%', value: '%' },
      { label: 'vh', value: 'vh' },
    ],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const unitOptions = computed(() => props.units)

const parseValue = (raw: unknown) => {
  if (raw == null || raw === '') {
    return { num: undefined as number | undefined, unit: props.defaultUnit }
  }
  const str = String(raw).trim()
  const matched = str.match(/^(-?\d+(?:\.\d+)?)(px|%|vh|vw)?$/)
  if (!matched) {
    const num = parseFloat(str)
    return {
      num: Number.isFinite(num) ? num : undefined,
      unit: props.defaultUnit,
    }
  }
  return {
    num: Number(matched[1]),
    unit: matched[2] || props.defaultUnit,
  }
}

const unitValue = ref(props.defaultUnit)

const numberValue = computed(() => {
  const { num } = parseValue(props.modelValue)
  return num
})

watch(
  () => props.modelValue,
  (value) => {
    unitValue.value = parseValue(value).unit
  },
  { immediate: true },
)

const emitValue = (num: number | null | undefined, unit: string) => {
  if (num == null || Number.isNaN(num)) {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', `${num}${unit}`)
}

const onNumberChange = (value: number | null | undefined) => {
  if (value == null || value === ('' as any)) {
    emit('update:modelValue', '')
    return
  }
  emitValue(Number(value), unitValue.value)
}

const onUnitChange = (unit: string) => {
  unitValue.value = unit
  const { num } = parseValue(props.modelValue)
  if (num != null && Number.isFinite(num)) {
    emitValue(num, unit)
  }
}
</script>

<style scoped>
.prop-dimension-input {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.prop-dimension-input__number {
  flex: 1 1 auto;
  min-width: 0;
}

.prop-dimension-input__unit {
  flex: 0 0 72px;
  width: 72px;
}

.prop-dimension-input__number :deep(.el-input-number),
.prop-dimension-input__number :deep(.n-input-number),
.prop-dimension-input__unit :deep(.el-select),
.prop-dimension-input__unit :deep(.n-select) {
  width: 100%;
}
</style>
