<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">标记</span>
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="symbolOptions"
        :model-value="model.symbol || 'circle'"
        @update:model-value="(v) => emit('patch', { symbol: String(v) })"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">大小</span>
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="model.symbolSize ?? 8"
        @update:model-value="(v) => emit('patch', { symbolSize: v == null ? undefined : Number(v) })"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">旋转</span>
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="model.symbolRotate"
        @update:model-value="(v) => emit('patch', { symbolRotate: v == null ? undefined : Number(v) })"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">偏移</span>
      <GrowInput
        class="min-w-0 flex-1"
        size="small"
        clearable
        :model-value="offsetText"
        placeholder="如 0,0"
        @update:model-value="(v) => emit('patch', { symbolOffset: String(v ?? '') })"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">保持比例</span>
      <GrowSwitch
        size="small"
        :model-value="!!model.symbolKeepAspect"
        @update:model-value="(v) => emit('patch', { symbolKeepAspect: !!v })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ChartSeriesSymbolFields' })

const props = defineProps<{
  model: Record<string, any>
}>()

const emit = defineEmits<{
  patch: [patch: Record<string, any>]
}>()

const symbolOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '圆角矩形', value: 'roundRect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '图钉', value: 'pin' },
  { label: '箭头', value: 'arrow' },
  { label: '无', value: 'none' },
]

const offsetText = computed(() =>
  Array.isArray(props.model.symbolOffset)
    ? props.model.symbolOffset.join(',')
    : props.model.symbolOffset || '',
)
</script>
