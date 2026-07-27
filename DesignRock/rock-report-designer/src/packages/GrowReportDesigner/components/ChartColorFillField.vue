<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">{{ label }}</span>
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="modeOptions"
        :model-value="mode"
        @update:model-value="onModeChange"
      />
    </div>

    <div v-if="mode === 'solid'" class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">颜色</span>
      <GrowColorPicker
        class="min-w-0 flex-1"
        size="small"
        show-alpha
        :model-value="solidColor || null"
        @update:model-value="(v) => emitSolid(String(v ?? ''))"
      />
    </div>

    <template v-else-if="mode === 'linear' || mode === 'radial'">
      <div class="flex items-center gap-2">
        <span class="w-20 shrink-0 text-xs text-text-secondary">起色</span>
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="fromColor || null"
          @update:model-value="(v) => emitGradient({ from: String(v ?? '') })"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="w-20 shrink-0 text-xs text-text-secondary">止色</span>
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="toColor || null"
          @update:model-value="(v) => emitGradient({ to: String(v ?? '') })"
        />
      </div>
      <div v-if="mode === 'linear'" class="flex items-center gap-2">
        <span class="w-20 shrink-0 text-xs text-text-secondary">角度°</span>
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :min="0"
          :max="360"
          :model-value="angle"
          @update:model-value="(v) => emitGradient({ angle: Number(v) || 0 })"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'ChartColorFillField',
})

type FillMode = 'auto' | 'solid' | 'linear' | 'radial'

type GradientColor = {
  type: 'linear' | 'radial'
  x?: number
  y?: number
  x2?: number
  y2?: number
  r?: number
  colorStops?: Array<{ offset: number; color: string }>
}

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: string | GradientColor | null
  }>(),
  {
    label: '颜色',
    modelValue: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | GradientColor | undefined]
}>()

const modeOptions = [
  { label: '自动', value: 'auto' },
  { label: '纯色', value: 'solid' },
  { label: '线性渐变', value: 'linear' },
  { label: '径向渐变', value: 'radial' },
]

const mode = computed<FillMode>(() => {
  const v = props.modelValue
  if (v == null || v === '') return 'auto'
  if (typeof v === 'string') return 'solid'
  if (v.type === 'radial') return 'radial'
  if (v.type === 'linear') return 'linear'
  return 'auto'
})

const solidColor = computed(() =>
  typeof props.modelValue === 'string' ? props.modelValue : '',
)

const fromColor = computed(() => {
  if (!props.modelValue || typeof props.modelValue === 'string') return ''
  return props.modelValue.colorStops?.[0]?.color || ''
})

const toColor = computed(() => {
  if (!props.modelValue || typeof props.modelValue === 'string') return ''
  return props.modelValue.colorStops?.[1]?.color || ''
})

const angle = computed(() => {
  if (!props.modelValue || typeof props.modelValue === 'string') return 90
  if (props.modelValue.type !== 'linear') return 90
  const { x = 0, y = 0, x2 = 0, y2 = 1 } = props.modelValue
  const rad = Math.atan2(y2 - y, x2 - x)
  let deg = Math.round((rad * 180) / Math.PI)
  if (deg < 0) deg += 360
  return deg
})

const linearCoordsFromAngle = (deg: number) => {
  const rad = (deg * Math.PI) / 180
  return {
    x: 0.5 - Math.cos(rad) / 2,
    y: 0.5 - Math.sin(rad) / 2,
    x2: 0.5 + Math.cos(rad) / 2,
    y2: 0.5 + Math.sin(rad) / 2,
  }
}

const onModeChange = (next: string | FillMode) => {
  const mode = next as FillMode
  if (mode === 'auto') {
    emit('update:modelValue', undefined)
    return
  }
  if (mode === 'solid') {
    emit('update:modelValue', solidColor.value || '#5470C6')
    return
  }
  if (mode === 'linear') {
    emit('update:modelValue', {
      type: 'linear',
      ...linearCoordsFromAngle(90),
      colorStops: [
        { offset: 0, color: fromColor.value || 'rgba(84, 112, 198, 0.15)' },
        { offset: 1, color: toColor.value || 'rgba(84, 112, 198, 0.85)' },
      ],
    })
    return
  }
  emit('update:modelValue', {
    type: 'radial',
    x: 0.5,
    y: 0.5,
    r: 0.5,
    colorStops: [
      { offset: 0, color: fromColor.value || 'rgba(84, 112, 198, 0.15)' },
      { offset: 1, color: toColor.value || 'rgba(84, 112, 198, 0.85)' },
    ],
  })
}

const emitSolid = (color: string) => {
  emit('update:modelValue', color || undefined)
}

const emitGradient = (patch: { from?: string; to?: string; angle?: number }) => {
  const nextMode = mode.value === 'radial' ? 'radial' : 'linear'
  const from = patch.from ?? fromColor.value
  const to = patch.to ?? toColor.value
  if (nextMode === 'linear') {
    const deg = patch.angle ?? angle.value
    emit('update:modelValue', {
      type: 'linear',
      ...linearCoordsFromAngle(deg),
      colorStops: [
        { offset: 0, color: from || 'rgba(84, 112, 198, 0.15)' },
        { offset: 1, color: to || 'rgba(84, 112, 198, 0.85)' },
      ],
    })
    return
  }
  emit('update:modelValue', {
    type: 'radial',
    x: 0.5,
    y: 0.5,
    r: 0.5,
    colorStops: [
      { offset: 0, color: from || 'rgba(84, 112, 198, 0.15)' },
      { offset: 1, color: to || 'rgba(84, 112, 198, 0.85)' },
    ],
  })
}
</script>
