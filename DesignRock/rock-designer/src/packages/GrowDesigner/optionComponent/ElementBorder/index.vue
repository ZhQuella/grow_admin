<template>
  <div class="element-border">
    <div class="element-border__body">
      <!-- 颜色 + 透明度 -->
      <div class="element-border__row">
        <label class="element-border__color">
          <span class="element-border__swatch-wrap">
            <span
              class="element-border__swatch-fill"
              :style="{ backgroundColor: cssColor }"
            />
            <input
              class="element-border__swatch"
              type="color"
              :value="hexValue"
              @input="onColorPick"
            />
          </span>
          <input
            class="element-border__hex"
            type="text"
            maxlength="7"
            autocomplete="off"
            :value="hexText"
            @input="onColorText"
          />
        </label>
        <label class="element-border__alpha" title="透明度">
          <input
            class="element-border__alpha-input"
            type="text"
            inputmode="numeric"
            maxlength="3"
            :value="alphaPercent"
            @input="onAlphaInput"
          />
          <span>%</span>
        </label>
      </div>

      <!-- 线型 + 宽度 -->
      <div class="element-border__row">
        <GrowSelect
          class="element-border__style"
          size="small"
          :options="styleOptions"
          :model-value="borderStyle"
          @update:model-value="onStyleChange"
        />

        <template v-if="linked">
          <GrowSelect
            class="element-border__width"
            size="small"
            :options="widthOptions"
            :model-value="String(unifiedWidth)"
            @update:model-value="onUnifiedWidthChange"
          />
        </template>
      </div>

      <!-- 四边独立宽度 -->
      <div v-if="!linked" class="element-border__sides">
        <label
          v-for="item in sides"
          :key="item.key"
          class="element-border__side"
          :title="item.title"
        >
          <span class="element-border__side-icon" :class="`is-${item.pos}`" />
          <input
            class="element-border__side-input"
            type="text"
            inputmode="numeric"
            maxlength="3"
            :value="sideWidth(item.key)"
            @input="(event) => onSideWidthInput(item.key, event)"
          />
        </label>
      </div>
    </div>

    <button
      type="button"
      class="element-border__link"
      :class="{ 'is-active': linked }"
      :title="linked ? '取消四边联动' : '四边联动'"
      @click="toggleLinked"
    >
      <span class="element-border__link-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'

defineOptions({ name: 'ElementBorder' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)

const SIDE_KEYS = [
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
] as const

type SideKey = (typeof SIDE_KEYS)[number]

const sides: Array<{ key: SideKey; pos: string; title: string }> = [
  { key: 'border-top-width', pos: 'top', title: '上边框' },
  { key: 'border-right-width', pos: 'right', title: '右边框' },
  { key: 'border-bottom-width', pos: 'bottom', title: '下边框' },
  { key: 'border-left-width', pos: 'left', title: '左边框' },
]

/** 选项展示线型预览字符，贴近设计稿 */
const styleOptions = [
  { label: '────────', value: 'solid' },
  { label: '- - - - -', value: 'dashed' },
  { label: '· · · · ·', value: 'dotted' },
  { label: '════', value: 'double' },
  { label: '无', value: 'none' },
]

const widthOptions = Array.from({ length: 21 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

const linked = ref(true)
const DEFAULT_HEX = '#BBBBBB'

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

const parseColor = (value: unknown): { hex: string; alpha: number } | null => {
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
  if (!rgb) return DEFAULT_HEX
  const a = clampAlpha(alpha)
  if (a >= 1) return hex.toUpperCase()
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.round(a * 1000) / 1000})`
}

const parseWidth = (value: unknown) => {
  if (value == null || value === '') return 0
  const num = parseFloat(String(value))
  return Number.isFinite(num) ? Math.round(num) : 0
}

const styles = computed(() => styleOption.value || {})

const borderStyle = computed(() => {
  const value = styles.value['border-style'] || styles.value['border-top-style'] || 'solid'
  return String(value)
})

const colorParsed = computed(() => {
  const raw = styles.value['border-color'] || styles.value['border-top-color'] || DEFAULT_HEX
  return parseColor(raw) || { hex: DEFAULT_HEX, alpha: 1 }
})

const hexValue = computed(() => colorParsed.value.hex)
const hexText = computed(() => colorParsed.value.hex.replace('#', ''))
const alphaPercent = computed(() => Math.round(colorParsed.value.alpha * 100))
const cssColor = computed(() => toCssColor(colorParsed.value.hex, colorParsed.value.alpha))

const unifiedWidth = computed(() => {
  if (styles.value['border-width'] != null) return parseWidth(styles.value['border-width'])
  if (styles.value['border-top-width'] != null) return parseWidth(styles.value['border-top-width'])
  return 1
})

const sideWidth = (key: SideKey) => {
  if (styles.value[key] != null) return String(parseWidth(styles.value[key]))
  if (styles.value['border-width'] != null) return String(parseWidth(styles.value['border-width']))
  return '0'
}

const allSidesEqual = (source: Record<string, any>) => {
  const values = SIDE_KEYS.map((key) =>
    parseWidth(source[key] ?? source['border-width'] ?? 0),
  )
  return values.every((value) => value === values[0])
}

watch(
  styleOption,
  (source) => {
    if (!source) return
    const hasPerSide = SIDE_KEYS.some((key) => source[key] != null && source[key] !== '')
    if (hasPerSide && !allSidesEqual(source)) {
      linked.value = false
    } else if (hasPerSide && allSidesEqual(source) && source['border-width'] == null) {
      // 保持用户手动切换的联动状态，不强制改回
    }
  },
  { deep: true },
)

const ensureBorderBasics = (result: Record<string, any>) => {
  if (!result['border-style'] && !result['border-top-style']) {
    result['border-style'] = 'solid'
  }
  if (!result['border-color'] && !result['border-top-color']) {
    result['border-color'] = DEFAULT_HEX
  }
  const hasWidth =
    result['border-width'] != null || SIDE_KEYS.some((key) => result[key] != null)
  if (!hasWidth) {
    result['border-width'] = '1px'
  }
}

const onColorPick = (event: Event) => {
  const hex = expandHex((event.target as HTMLInputElement).value).slice(0, 7)
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  result['border-color'] = toCssColor(hex, colorParsed.value.alpha)
  emit('update:styleOption', result)
}

const onColorText = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.trim()
  const parsed = parseColor(raw.startsWith('#') ? raw : `#${raw}`)
  if (!parsed) return
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  result['border-color'] = toCssColor(parsed.hex, colorParsed.value.alpha)
  emit('update:styleOption', result)
}

const onAlphaInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const percent = raw === '' ? 100 : Math.min(100, Number(raw))
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  result['border-color'] = toCssColor(colorParsed.value.hex, percent / 100)
  emit('update:styleOption', result)
}

const onStyleChange = (value: string) => {
  const result = { ...styleOption.value, 'border-style': value }
  for (const key of SIDE_KEYS) {
    Reflect.deleteProperty(result, key.replace('-width', '-style'))
  }
  if (value !== 'none' && result['border-width'] == null && !SIDE_KEYS.some((k) => result[k] != null)) {
    result['border-width'] = '1px'
  }
  if (!result['border-color'] && !result['border-top-color']) {
    result['border-color'] = DEFAULT_HEX
  }
  emit('update:styleOption', result)
}

const onUnifiedWidthChange = (value: string | number) => {
  const width = Number(value) || 0
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  result['border-width'] = `${width}px`
  for (const key of SIDE_KEYS) {
    Reflect.deleteProperty(result, key)
  }
  emit('update:styleOption', result)
}

const onSideWidthInput = (key: SideKey, event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const width = raw === '' ? 0 : Number(raw)
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  Reflect.deleteProperty(result, 'border-width')
  for (const side of SIDE_KEYS) {
    if (result[side] == null) {
      result[side] = `${parseWidth(styles.value['border-width'])}px`
    }
  }
  result[key] = `${width}px`
  emit('update:styleOption', result)
}

const toggleLinked = () => {
  linked.value = !linked.value
  const result = { ...styleOption.value }
  ensureBorderBasics(result)
  if (linked.value) {
    const base = sideWidth('border-top-width')
    result['border-width'] = `${base}px`
    for (const key of SIDE_KEYS) {
      Reflect.deleteProperty(result, key)
    }
  } else {
    const base = unifiedWidth.value
    Reflect.deleteProperty(result, 'border-width')
    for (const key of SIDE_KEYS) {
      result[key] = `${base}px`
    }
  }
  emit('update:styleOption', result)
}
</script>

<style lang="scss" scoped>
.element-border {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px 12px;
}

.element-border__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-border__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.element-border__color {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 32px;
  padding: 0 10px 0 6px;
  border-radius: 4px;
  background: transparent;
  box-sizing: border-box;
}

.element-border__swatch-wrap {
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  background:
    linear-gradient(45deg, #eee 25%, transparent 25%) 0 0 / 6px 6px,
    linear-gradient(-45deg, #eee 25%, transparent 25%) 0 3px / 6px 6px,
    #fff;
}

.element-border__swatch-fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.element-border__swatch {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.element-border__hex {
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

.element-border__alpha {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  height: 32px;
  padding: 0 4px;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
  box-sizing: border-box;
}

.element-border__alpha-input {
  width: 28px;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font-size: 13px;
  color: var(--text-color-secondary, #909399);
  font-variant-numeric: tabular-nums;
}

.element-border__style {
  flex: 1;
  min-width: 0;
}

.element-border__width {
  width: 72px;
  flex-shrink: 0;
}

.element-border__sides {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.element-border__side {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 6px;
  background: var(--component-background-color, #fff);
  box-sizing: border-box;
}

.element-border__side-icon {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border: 1.5px solid #c0c4cc;
  box-sizing: border-box;
  opacity: 0.7;

  &.is-top {
    border-right: none;
    border-bottom: none;
    border-left: none;
  }

  &.is-right {
    border-top: none;
    border-bottom: none;
    border-left: none;
  }

  &.is-bottom {
    border-top: none;
    border-right: none;
    border-left: none;
  }

  &.is-left {
    border-top: none;
    border-right: none;
    border-bottom: none;
  }
}

.element-border__side-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-color, #606266);
  font-variant-numeric: tabular-nums;
}

.element-border__link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-top: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #c0c4cc;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: var(--primary-color, #2f6bff);
    background: color-mix(in srgb, var(--primary-color, #2f6bff) 8%, transparent);
  }

  &.is-active {
    color: var(--primary-color, #2f6bff);
  }
}

/* 四边断开的方框图标，对齐设计稿 */
.element-border__link-icon {
  width: 14px;
  height: 14px;
  background:
    linear-gradient(currentColor, currentColor) 3px 0 / 8px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 3px 100% / 8px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 0 3px / 1.5px 8px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 3px / 1.5px 8px no-repeat;
}
</style>
