<template>
  <div class="element-shadow">
    <div class="element-shadow__row">
      <GrowColorPicker
        class="element-shadow__picker"
        size="small"
        show-alpha
        :model-value="cssColor || null"
        @update:model-value="onColorChange"
      />
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

const parseBoxShadow = (raw: unknown): ShadowMeta => {
  const fallback: ShadowMeta = {
    ...DEFAULT_OFFSET,
    inset: false,
    color: { hex: DEFAULT_HEX, alpha: DEFAULT_ALPHA },
  }
  if (raw == null || raw === '' || raw === 'none') return fallback
  const text = String(raw).trim()
  const inset = /\binset\b/i.test(text)
  const withoutInset = text.replace(/\binset\b/gi, ' ').replace(/\s+/g, ' ').trim()
  const colorMatch =
    withoutInset.match(/rgba?\([^)]+\)/i) || withoutInset.match(/#[0-9a-fA-F]{3,8}\b/)
  const colorRaw = colorMatch ? colorMatch[0] : ''
  const lengthsPart = colorRaw
    ? withoutInset.replace(colorRaw, ' ').replace(/\s+/g, ' ').trim()
    : withoutInset
  const nums = lengthsPart
    .split(/\s+/)
    .map((item) => parseFloat(item))
    .filter((n) => Number.isFinite(n))
  const color = parseColor(colorRaw) || fallback.color
  return {
    x: nums[0] ?? fallback.x,
    y: nums[1] ?? fallback.y,
    blur: nums[2] ?? fallback.blur,
    spread: nums[3] ?? fallback.spread,
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

const cssColor = computed(() =>
  toCssColor(shadowMeta.value.color.hex, shadowMeta.value.color.alpha),
)

const onColorChange = (value: string | null) => {
  const next = String(value || '').trim()
  const parsed = parseColor(next) || {
    hex: DEFAULT_HEX,
    alpha: DEFAULT_ALPHA,
  }
  const meta = {
    ...shadowMeta.value,
    color: parsed,
  }
  const result = { ...styleOption.value, 'box-shadow': buildBoxShadow(meta) }
  emit('update:styleOption', result)
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
}

.element-shadow__picker {
  flex: 1;
  min-width: 0;
}
</style>
