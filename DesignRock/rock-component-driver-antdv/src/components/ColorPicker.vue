<template>
  <div class="antdv-color-picker" :class="[`is-${size}`]">
    <span class="antdv-color-picker__swatch">
      <span
        class="antdv-color-picker__fill"
        :style="{ backgroundColor: displayValue || 'transparent' }"
      />
      <input
        class="antdv-color-picker__native"
        type="color"
        :value="hexForNative"
        @input="onNativeInput"
      />
    </span>
    <Input
      class="antdv-color-picker__input"
      size="small"
      allow-clear
      :value="displayValue"
      placeholder="#000000 / rgba()"
      @update:value="onTextInput"
    />
  </div>
</template>

<script lang="ts" setup>
/**
 * ant-design-vue@4.2 尚未内置 ColorPicker，提供兼容实现。
 * 统一输出 string | null，对齐 GrowColorPicker 的 v-model。
 */
import { computed } from 'vue'
import { Input } from 'ant-design-vue'

defineOptions({ name: 'ColorPicker' })

const props = withDefaults(
  defineProps<{
    value?: string | null
    modelValue?: string | null
    size?: 'small' | 'medium' | 'large'
    showAlpha?: boolean
  }>(),
  {
    value: undefined,
    modelValue: undefined,
    size: 'medium',
    showAlpha: true,
  },
)

const emit = defineEmits<{
  'update:value': [value: string | null]
  'update:modelValue': [value: string | null]
}>()

const displayValue = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) return String(props.modelValue)
  if (props.value !== undefined && props.value !== null) return String(props.value)
  return ''
})

const expandHex = (hex: string) => {
  let value = hex.trim()
  if (!value.startsWith('#')) value = `#${value}`
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  return value
}

const hexForNative = computed(() => {
  const raw = displayValue.value.trim()
  const match = raw.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/)
  if (match) return expandHex(`#${match[1]}`).slice(0, 7)
  const rgba = raw.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (rgba) {
    const toHex = (n: number) =>
      Math.round(Number(n)).toString(16).padStart(2, '0')
    return `#${toHex(Number(rgba[1]))}${toHex(Number(rgba[2]))}${toHex(Number(rgba[3]))}`
  }
  return '#000000'
})

const emitValue = (next: string | null) => {
  emit('update:value', next)
  emit('update:modelValue', next)
}

const onNativeInput = (event: Event) => {
  const hex = expandHex((event.target as HTMLInputElement).value).slice(0, 7)
  emitValue(hex.toUpperCase())
}

const onTextInput = (raw: string | null) => {
  const next = String(raw ?? '').trim()
  emitValue(next ? next : null)
}
</script>

<style scoped>
.antdv-color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.antdv-color-picker__swatch {
  position: relative;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  background:
    linear-gradient(45deg, #eee 25%, transparent 25%) 0 0 / 8px 8px,
    linear-gradient(-45deg, #eee 25%, transparent 25%) 0 4px / 8px 8px,
    #fff;
}

.antdv-color-picker.is-small .antdv-color-picker__swatch {
  width: 24px;
  height: 24px;
}

.antdv-color-picker__fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.antdv-color-picker__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
}

.antdv-color-picker__input {
  flex: 1;
  min-width: 0;
}
</style>
