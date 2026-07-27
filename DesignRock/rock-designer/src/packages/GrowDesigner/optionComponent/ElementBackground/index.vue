<template>
  <div class="element-background">
    <div class="element-background__row">
      <GrowColorPicker
        class="element-background__picker"
        size="small"
        show-alpha
        :model-value="cssColor || null"
        @update:model-value="onColorChange"
      />
      <button
        v-if="hasColor"
        type="button"
        class="element-background__clear"
        title="清除背景色"
        @click="onClear"
      >
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

defineOptions({ name: 'ElementBackground' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)

const rawBackground = computed(
  () => styleOption.value?.['background-color'] ?? styleOption.value?.background ?? '',
)

const cssColor = computed(() => {
  const raw = String(rawBackground.value || '').trim()
  if (!raw || raw === 'transparent') return ''
  return raw
})

const hasColor = computed(() => Boolean(cssColor.value))

const onColorChange = (value: string | null) => {
  const result = { ...styleOption.value }
  const next = String(value || '').trim()
  if (!next || next === 'transparent') {
    Reflect.deleteProperty(result, 'background-color')
    Reflect.deleteProperty(result, 'background')
  } else {
    result['background-color'] = next
    Reflect.deleteProperty(result, 'background')
  }
  emit('update:styleOption', result)
}

const onClear = () => {
  onColorChange(null)
}
</script>

<style lang="scss" scoped>
.element-background {
  padding: 8px 12px 12px;
}

.element-background__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-background__picker {
  flex: 1;
  min-width: 0;
}

.element-background__clear {
  flex-shrink: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 6px;
  background: var(--component-background-color, #fff);
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: var(--primary-color);
    border-color: color-mix(in srgb, var(--primary-color, #2f6bff) 35%, #e4e7ed);
  }
}
</style>
