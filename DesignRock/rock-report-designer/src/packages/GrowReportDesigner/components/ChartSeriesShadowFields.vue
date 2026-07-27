<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">阴影模糊</span>
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="bag.shadowBlur"
        @update:model-value="(v) => set('shadowBlur', v == null ? undefined : Number(v))"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">阴影色</span>
      <GrowColorPicker
        class="min-w-0 flex-1"
        size="small"
        show-alpha
        :model-value="bag.shadowColor || null"
        @update:model-value="(v) => set('shadowColor', v || undefined)"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">阴影 X</span>
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="bag.shadowOffsetX"
        @update:model-value="(v) => set('shadowOffsetX', v == null ? undefined : Number(v))"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 shrink-0 text-xs text-text-secondary">阴影 Y</span>
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="bag.shadowOffsetY"
        @update:model-value="(v) => set('shadowOffsetY', v == null ? undefined : Number(v))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ChartSeriesShadowFields' })

const props = defineProps<{
  prefix: string
  model: Record<string, any>
}>()

const emit = defineEmits<{
  'patch-nested': [path: string, value: unknown]
}>()

const bag = computed(() => (props.model[props.prefix] || {}) as Record<string, any>)

const set = (key: string, value: unknown) => {
  emit('patch-nested', `${props.prefix}.${key}`, value)
}
</script>
