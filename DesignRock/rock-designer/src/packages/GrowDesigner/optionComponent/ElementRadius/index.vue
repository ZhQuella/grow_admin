<template>
  <div class="element-radius">
    <div class="element-radius__main">
      <!-- 四角联动：单输入 -->
      <label v-if="isLinked" class="element-radius__field is-unified" title="四角圆角">
        <input
          class="element-radius__input"
          type="text"
          inputmode="numeric"
          maxlength="4"
          autocomplete="off"
          :value="unifiedValue"
          @input="onUnifiedInput"
        />
      </label>

      <!-- 取消联动：独立四角 -->
      <div v-else class="element-radius__grid">
        <label
          v-for="item in corners"
          :key="item.key"
          class="element-radius__field"
          :title="item.title"
        >
          <span class="element-radius__corner" :class="`is-${item.pos}`" aria-hidden="true" />
          <input
            class="element-radius__input"
            type="text"
            inputmode="numeric"
            maxlength="4"
            autocomplete="off"
            :value="cornerValue(item.key)"
            @input="(event) => onCornerInput(item.key, event)"
          />
        </label>
      </div>
    </div>

    <button
      type="button"
      class="element-radius__link"
      :class="{ 'is-active': !isLinked }"
      :aria-pressed="!isLinked"
      :title="isLinked ? '取消四角联动' : '四角联动'"
      @click="toggleLinked"
    >
      <span class="element-radius__link-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'

defineOptions({ name: 'ElementRadius' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)

const CORNER_KEYS = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
] as const

type CornerKey = (typeof CORNER_KEYS)[number]

const corners: Array<{ key: CornerKey; pos: string; title: string }> = [
  { key: 'border-top-left-radius', pos: 'tl', title: '左上圆角' },
  { key: 'border-top-right-radius', pos: 'tr', title: '右上圆角' },
  { key: 'border-bottom-left-radius', pos: 'bl', title: '左下圆角' },
  { key: 'border-bottom-right-radius', pos: 'br', title: '右下圆角' },
]

/** true = 四角联动（统一圆角，按钮选中） */
const isLinked = ref(true)
const unit = 'px'

const parseRadius = (value: unknown) => {
  if (value == null || value === '') return ''
  const num = parseFloat(String(value))
  return Number.isFinite(num) ? String(num) : ''
}

const cornerValue = (key: CornerKey) => {
  const styles = styleOption.value || {}
  if (styles[key] != null && styles[key] !== '') {
    return parseRadius(styles[key])
  }
  if (styles['border-radius'] != null && styles['border-radius'] !== '') {
    return parseRadius(styles['border-radius'])
  }
  return '0'
}

const unifiedValue = computed(() => cornerValue('border-top-left-radius'))

const allCornersEqual = (styles: Record<string, any>) => {
  const values = CORNER_KEYS.map((key) => parseRadius(styles[key] ?? styles['border-radius'] ?? '0'))
  return values.every((value) => value === values[0])
}

watch(
  styleOption,
  (styles) => {
    if (!styles) return
    // 四角数值不一致 → 退出联动（按钮取消选中）
    if (isLinked.value && !allCornersEqual(styles)) {
      isLinked.value = false
    }
  },
  { deep: true },
)

const emitStyles = (next: Record<string, any>) => {
  const values = CORNER_KEYS.map((key) => parseRadius(next[key]))
  const same = values.every((value) => value === values[0])
  if (same) {
    const n = values[0] === '' ? '0' : values[0]
    next['border-radius'] = `${n}${unit}`
  } else {
    Reflect.deleteProperty(next, 'border-radius')
  }
  emit('update:styleOption', next)
}

const applyAllCorners = (raw: string) => {
  const value = raw === '' ? '0' : raw
  const result = { ...styleOption.value }
  for (const corner of CORNER_KEYS) {
    result[corner] = `${value}${unit}`
  }
  emitStyles(result)
}

const onUnifiedInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/[^\d.]/g, '')
  applyAllCorners(raw)
}

const onCornerInput = (key: CornerKey, event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/[^\d.]/g, '')
  const result = { ...styleOption.value }
  const value = raw === '' ? '0' : raw
  result[key] = `${value}${unit}`
  emitStyles(result)
}

const toggleLinked = () => {
  if (isLinked.value) {
    // 取消联动 → 展开四角，按钮取消选中
    isLinked.value = false
    return
  }
  // 开启联动 → 统一四角，按钮选中
  isLinked.value = true
  applyAllCorners(unifiedValue.value || '0')
}
</script>

<style lang="scss" scoped>
.element-radius {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px 12px;
}

.element-radius__main {
  flex: 1;
  min-width: 0;
}

.element-radius__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.element-radius__field {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 4px;
  background: var(--component-background-color, #fff);
  box-sizing: border-box;
  cursor: text;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--primary-color, #2f6bff) 35%, #e4e7ed);
  }

  &:focus-within {
    border-color: var(--primary-color, #2f6bff);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2f6bff) 16%, transparent);
  }

  &.is-unified {
    width: 100%;
  }
}

.element-radius__corner {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  opacity: 0.55;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1.5px solid currentColor;
    color: #909399;
    border-radius: 1px;
    box-sizing: border-box;
  }

  &.is-tl::before {
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 7px;
  }

  &.is-tr::before {
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 7px;
  }

  &.is-bl::before {
    border-right: none;
    border-top: none;
    border-bottom-left-radius: 7px;
  }

  &.is-br::before {
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 7px;
  }
}

.element-radius__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  line-height: 20px;
  color: var(--text-color, #303133);
  font-variant-numeric: tabular-nums;
}

.element-radius__link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 4px;
  background: var(--component-background-color, #fff);
  color: #c0c4cc;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    color: var(--primary-color, #2f6bff);
    border-color: color-mix(in srgb, var(--primary-color, #2f6bff) 35%, #e4e7ed);
  }

  /* 四角联动开启 → 选中；取消联动 → 不选中 */
  &.is-active {
    color: #fff;
    background: var(--primary-color, #2f6bff);
    border-color: var(--primary-color, #2f6bff);
  }
}

.element-radius__link-icon {
  width: 14px;
  height: 14px;
  background:
    linear-gradient(currentColor, currentColor) 0 0 / 5px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 0 0 / 1.5px 5px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 0 / 5px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 0 / 1.5px 5px no-repeat,
    linear-gradient(currentColor, currentColor) 0 100% / 5px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 0 100% / 1.5px 5px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 100% / 5px 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 100% / 1.5px 5px no-repeat;
}
</style>
