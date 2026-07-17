<template>
  <div class="element-shadow">
    <div class="element-shadow__row">
      <label class="element-shadow__color">
        <span class="element-shadow__swatch-wrap">
          <span
            class="element-shadow__swatch-solid"
            :style="{ backgroundColor: hexValue }"
          />
          <span
            class="element-shadow__swatch-alpha"
            :style="{ backgroundColor: cssColor }"
          />
          <input
            class="element-shadow__swatch"
            type="color"
            :value="hexValue"
            @input="onColorPick"
          />
        </span>
        <input
          class="element-shadow__hex"
          type="text"
          maxlength="7"
          autocomplete="off"
          :value="hexText"
          @input="onColorText"
        />
      </label>
      <label class="element-shadow__alpha" title="透明度">
        <input
          class="element-shadow__alpha-input"
          type="text"
          inputmode="numeric"
          maxlength="3"
          :value="alphaPercent"
          @input="onAlphaInput"
        />
        <span>%</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

defineOptions({ name: 'ElementShadow' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)

const DEFAULT_HEX = '#000000'
const DEFAULT_ALPHA = 0.4
const DEFAULT_OFFSET = { x: 0, y: 2, blur: 8, spread: 0 }

type ParsedColor = { hex: string; alpha: number }
type ShadowMeta = {
  x: number
  y: number
  blur: number
  spread: number
  inset: boolean
  color: ParsedColor
}

const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha))

const expandHex = (hex: string) => {
  let value = hex.trim()
  if (!value.startsWith('#')) value = `#${value}`
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  return value.toUpperCase()
}

const hexToRgb = (hex: string) => {
  const normalized = expandHex(hex)
  if (!/^#[0-9A-F]{6}$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  }
}

const parseColor = (value: unknown): ParsedColor | null => {
  if (value == null || value === '') return null
  const raw = String(value).trim()
  const rgbaMatch = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  )
  if (rgbaMatch) {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()
    let alpha = 1
    if (rgbaMatch[4] != null) {
      alpha = String(rgbaMatch[4]).endsWith('%')
        ? Number(rgbaMatch[4].replace('%', '')) / 100
        : Number(rgbaMatch[4])
    }
    return {
      hex: `#${toHex(Number(rgbaMatch[1]))}${toHex(Number(rgbaMatch[2]))}${toHex(Number(rgbaMatch[3]))}`,
      alpha: clampAlpha(alpha),
    }
  }
  const expanded = expandHex(raw)
  if (!/^#[0-9A-F]{6}$/.test(expanded)) return null
  return { hex: expanded, alpha: 1 }
}

const toCssColor = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(0, 0, 0, ${DEFAULT_ALPHA})`
  const a = clampAlpha(alpha)
  if (a >= 1) return hex.toUpperCase()
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.round(a * 1000) / 1000})`
}

const parseLength = (value: string) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : 0
}

/** 解析 box-shadow，取第一层；无则用默认偏移 + 附件默认色 */
const parseBoxShadow = (value: unknown): ShadowMeta => {
  const fallback: ShadowMeta = {
    ...DEFAULT_OFFSET,
    inset: false,
    color: { hex: DEFAULT_HEX, alpha: DEFAULT_ALPHA },
  }
  if (value == null || value === '' || value === 'none') return fallback

  const raw = String(value).trim()
  // 取逗号分隔的第一层（忽略 rgba 内逗号）
  const firstLayer = raw.split(/,(?![^(]*\))/).map((s) => s.trim())[0] || raw
  const inset = /\binset\b/i.test(firstLayer)
  const withoutInset = firstLayer.replace(/\binset\b/gi, '').trim()

  const colorMatch =
    withoutInset.match(/rgba?\([^)]+\)/i) || withoutInset.match(/#[0-9a-fA-F]{3,8}\b/)
  const colorRaw = colorMatch ? colorMatch[0] : ''
  const lengthsPart = colorRaw
    ? withoutInset.replace(colorRaw, ' ').replace(/\s+/g, ' ').trim()
    : withoutInset
  const lengths = lengthsPart.split(/\s+/).filter(Boolean)
  const color = parseColor(colorRaw) || fallback.color

  return {
    x: lengths[0] != null ? parseLength(lengths[0]) : DEFAULT_OFFSET.x,
    y: lengths[1] != null ? parseLength(lengths[1]) : DEFAULT_OFFSET.y,
    blur: lengths[2] != null ? parseLength(lengths[2]) : DEFAULT_OFFSET.blur,
    spread: lengths[3] != null ? parseLength(lengths[3]) : DEFAULT_OFFSET.spread,
    inset,
    color,
  }
}

const buildBoxShadow = (meta: ShadowMeta) => {
  const color = toCssColor(meta.color.hex, meta.color.alpha)
  const parts = [`${meta.x}px`, `${meta.y}px`, `${meta.blur}px`, `${meta.spread}px`, color]
  if (meta.inset) parts.unshift('inset')
  return parts.join(' ')
}

const shadowMeta = computed(() => parseBoxShadow(styleOption.value?.['box-shadow']))

const hexValue = computed(() => shadowMeta.value.color.hex)
const hexText = computed(() => shadowMeta.value.color.hex.replace('#', ''))
const alphaPercent = computed(() => Math.round(shadowMeta.value.color.alpha * 100))
const cssColor = computed(() =>
  toCssColor(shadowMeta.value.color.hex, shadowMeta.value.color.alpha),
)

const emitShadow = (hex: string, alpha: number) => {
  const meta = {
    ...shadowMeta.value,
    color: { hex, alpha: clampAlpha(alpha) },
  }
  const result = { ...styleOption.value, 'box-shadow': buildBoxShadow(meta) }
  emit('update:styleOption', result)
}

const onColorPick = (event: Event) => {
  const hex = expandHex((event.target as HTMLInputElement).value).slice(0, 7)
  emitShadow(hex, shadowMeta.value.color.alpha)
}

const onColorText = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.trim()
  const parsed = parseColor(raw.startsWith('#') ? raw : `#${raw}`)
  if (!parsed) return
  emitShadow(parsed.hex, shadowMeta.value.color.alpha)
}

const onAlphaInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const percent = raw === '' ? Math.round(DEFAULT_ALPHA * 100) : Math.min(100, Number(raw))
  emitShadow(shadowMeta.value.color.hex, percent / 100)
}
</script>

<style lang="scss" scoped>
.element-shadow {
  padding: 8px 12px 12px;
}

.element-shadow__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.element-shadow__color {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 24px;
  box-sizing: border-box;
}

.element-shadow__swatch-wrap {
  position: relative;
  flex-shrink: 0;
  display: flex;
  width: 18px;
  height: 18px;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  background:
    linear-gradient(45deg, #dcdfe6 25%, transparent 25%) 0 0 / 6px 6px,
    linear-gradient(-45deg, #dcdfe6 25%, transparent 25%) 0 3px / 6px 6px,
    linear-gradient(45deg, transparent 75%, #dcdfe6 75%) 3px -3px / 6px 6px,
    linear-gradient(-45deg, transparent 75%, #dcdfe6 75%) -3px 0 / 6px 6px,
    #fff;
}

.element-shadow__swatch-solid {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.element-shadow__swatch-alpha {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.element-shadow__swatch {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.element-shadow__hex {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--text-color-secondary, #909399);
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
}

.element-shadow__alpha {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  height: 24px;
  padding: 0 2px;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
  box-sizing: border-box;
}

.element-shadow__alpha-input {
  width: 28px;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font-size: 13px;
  color: var(--text-color-secondary, #909399);
  font-variant-numeric: tabular-nums;
}
</style>
