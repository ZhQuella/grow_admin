<template>
  <div class="prop-table-height">
    <GrowSelect
      class="prop-table-height__mode"
      size="small"
      :options="modeOptions"
      :model-value="mode"
      @update:model-value="onModeChange"
    />
    <GrowInputNumber
      v-if="mode === 'fixed'"
      class="prop-table-height__number"
      size="small"
      :controls="false"
      :min="0"
      placeholder="如 400"
      :model-value="fixedNumber"
      @update:model-value="onFixedChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'PropTableHeight' })

/** 约定：空=默认；layout-main=适应主区域；其余为固定高度（数字或带 px） */
const LAYOUT_MAIN = 'layout-main'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
  }>(),
  {
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modeOptions = [
  { label: '默认', value: 'auto' },
  { label: '适应主区域高度', value: LAYOUT_MAIN },
  { label: '固定高度', value: 'fixed' },
]

const parseMode = (raw: unknown): 'auto' | 'layout-main' | 'fixed' => {
  if (raw == null || raw === '') return 'auto'
  const str = String(raw).trim()
  if (str === LAYOUT_MAIN) return LAYOUT_MAIN
  return 'fixed'
}

const mode = computed(() => parseMode(props.modelValue))

const fixedNumber = computed(() => {
  if (mode.value !== 'fixed') return undefined
  const str = String(props.modelValue ?? '').trim().replace(/px$/i, '')
  const num = Number(str)
  return Number.isFinite(num) ? num : undefined
})

const onModeChange = (next: string) => {
  if (next === 'auto') {
    emit('update:modelValue', '')
    return
  }
  if (next === LAYOUT_MAIN) {
    emit('update:modelValue', LAYOUT_MAIN)
    return
  }
  const current = fixedNumber.value
  emit('update:modelValue', current != null ? String(current) : '400')
}

const onFixedChange = (val: number | null | undefined) => {
  if (val == null || Number.isNaN(Number(val))) {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', String(val))
}
</script>

<style scoped>
.prop-table-height {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.prop-table-height__mode {
  flex: 1;
  min-width: 0;
}

.prop-table-height__number {
  width: 110px;
  flex: none;
}
</style>
