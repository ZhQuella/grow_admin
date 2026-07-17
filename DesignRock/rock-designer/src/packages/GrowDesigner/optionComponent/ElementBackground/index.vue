<template>
  <div class="element-background">
    <div class="element-background__row">
      <label class="element-background__field">
        <span class="element-background__swatch-wrap">
          <span
            class="element-background__swatch-fill"
            :style="{ backgroundColor: cssColor || 'transparent' }"
          />
          <input
            class="element-background__swatch"
            type="color"
            :value="hexValue"
            :title="hexValue"
            @input="onColorPick"
          />
        </span>
        <GrowInput
          class="element-background__input"
          size="small"
          clearable
          placeholder="#FFFFFF"
          :model-value="hexText"
          @update:model-value="onColorText"
          @clear="onClear"
        />
      </label>

      <label class="element-background__alpha" title="透明度">
        <GrowInputNumber
          class="element-background__alpha-input"
          size="small"
          :min="0"
          :max="100"
          :step="1"
          :controls="false"
          :model-value="alphaPercent"
          @update:model-value="onAlphaChange"
        />
        <span class="element-background__alpha-unit">%</span>
      </label>

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

const DEFAULT_HEX = '#FFFFFF'

type ParsedColor = { hex: string; alpha: number }

const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha))

const expandHex = (hex: string) => {
  let value = hex.trim()
  if (!value.startsWith('#')) value = `#${value}`
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  if (/^#[0-9a-fA-F]{4}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}${value[4]}${value[4]}`
  }
  return value.toUpperCase()
}

const hexToRgb = (hex: string) => {
  const normalized = expandHex(hex)
  if (!/^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
    a:
      normalized.length === 9
        ? parseInt(normalized.slice(7, 9), 16) / 255
        : 1,
  }
}

const parseColor = (value: unknown): ParsedColor | null => {
  if (value == null || value === '') return null
  const raw = String(value).trim()
  if (!raw) return null

  const rgbaMatch = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  )
  if (rgbaMatch) {
    const r = Math.round(Number(rgbaMatch[1]))
    const g = Math.round(Number(rgbaMatch[2]))
    const b = Math.round(Number(rgbaMatch[3]))
    let alpha = 1
    if (rgbaMatch[4] != null) {
      alpha = String(rgbaMatch[4]).endsWith('%')
        ? Number(rgbaMatch[4].replace('%', '')) / 100
        : Number(rgbaMatch[4])
    }
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      alpha: clampAlpha(alpha),
    }
  }

  const expanded = expandHex(raw)
  const rgb = hexToRgb(expanded)
  if (!rgb) return null
  return {
    hex: `#${expanded.slice(1, 7)}`,
    alpha: clampAlpha(rgb.a),
  }
}

const toCssColor = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return ''
  const a = clampAlpha(alpha)
  if (a >= 1) return hex.toUpperCase()
  const rounded = Math.round(a * 1000) / 1000
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rounded})`
}

const rawBackground = computed(
  () => styleOption.value?.['background-color'] ?? styleOption.value?.background ?? '',
)

const parsed = computed(() => parseColor(rawBackground.value))

const hasColor = computed(() => Boolean(parsed.value || rawBackground.value))

const hexValue = computed(() => parsed.value?.hex || DEFAULT_HEX)

const hexText = computed(() => parsed.value?.hex || '')

const alphaPercent = computed(() =>
  Math.round((parsed.value?.alpha ?? 1) * 100),
)

const cssColor = computed(() => {
  if (!parsed.value) return ''
  return toCssColor(parsed.value.hex, parsed.value.alpha)
})

const emitColor = (hex: string, alpha: number) => {
  const result = { ...styleOption.value }
  const css = toCssColor(hex, alpha)
  if (!css) {
    Reflect.deleteProperty(result, 'background-color')
    Reflect.deleteProperty(result, 'background')
  } else {
    result['background-color'] = css
    Reflect.deleteProperty(result, 'background')
  }
  emit('update:styleOption', result)
}

const onColorPick = (event: Event) => {
  const hex = expandHex((event.target as HTMLInputElement).value).slice(0, 7)
  const alpha = parsed.value?.alpha ?? 1
  emitColor(hex, alpha)
}

const onColorText = (raw: string | null) => {
  if (raw == null || raw === '') {
    onClear()
    return
  }
  const next = parseColor(raw)
  if (!next) {
    // 输入未完成时暂不覆盖，避免打断编辑
    return
  }
  const alpha = parsed.value?.alpha ?? next.alpha
  emitColor(next.hex, alpha)
}

const onAlphaChange = (value: number | null) => {
  const hex = parsed.value?.hex || DEFAULT_HEX
  const alpha = value == null ? 1 : clampAlpha(Number(value) / 100)
  emitColor(hex, alpha)
}

const onClear = () => {
  const result = { ...styleOption.value }
  Reflect.deleteProperty(result, 'background-color')
  Reflect.deleteProperty(result, 'background')
  emit('update:styleOption', result)
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

.element-background__field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.element-background__swatch-wrap {
  position: relative;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 6px;
  background:
    linear-gradient(45deg, #eee 25%, transparent 25%) 0 0 / 8px 8px,
    linear-gradient(-45deg, #eee 25%, transparent 25%) 0 4px / 8px 8px,
    linear-gradient(45deg, transparent 75%, #eee 75%) 4px -4px / 8px 8px,
    linear-gradient(-45deg, transparent 75%, #eee 75%) -4px 0 / 8px 8px,
    #fff;
}

.element-background__swatch-fill {
  position: absolute;
  inset: 0;
  border-radius: 5px;
  pointer-events: none;
}

.element-background__swatch {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
}

.element-background__input {
  flex: 1;
  min-width: 0;
}

.element-background__alpha {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  width: 84px;
}

.element-background__alpha-input {
  flex: 1;
  min-width: 0;
}

.element-background__alpha-unit {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
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
