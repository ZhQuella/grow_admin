<template>
  <div v-if="allowLayoutMode" class="element-display">
    <div
      v-for="section in visibleSections"
      :key="section.key"
      class="element-display__section"
    >
      <span class="element-display__label">{{ section.label }}</span>
      <div class="element-display__group" role="radiogroup">
        <button
          v-for="item in section.options"
          :key="item.value"
          type="button"
          class="element-display__btn"
          :class="{ 'is-active': isActive(section.prop, item.value, section.fallback) }"
          :title="item.tip"
          @click="onStyleChange(section.prop, item.value)"
        >
          <!-- 主轴方向：色块排列 + 起点高亮 -->
          <span
            v-if="item.dirIcon"
            class="element-display__dir"
            :class="`is-${item.dirIcon}`"
            aria-hidden="true"
          >
            <i /><i /><i />
          </span>
          <!-- 换行：色块 + 流向箭头 -->
          <svg
            v-else-if="item.wrapIcon"
            class="element-display__wrap-svg"
            viewBox="0 0 18 14"
            width="18"
            height="14"
            aria-hidden="true"
          >
            <!-- 不换行：一直向右，不拐弯 -->
            <template v-if="item.wrapIcon === 'nowrap'">
              <rect x="0.5" y="4" width="3.2" height="6" rx="0.7" fill="currentColor" />
              <rect x="4.5" y="4" width="3.2" height="6" rx="0.7" fill="currentColor" opacity="0.65" />
              <rect x="8.5" y="4" width="3.2" height="6" rx="0.7" fill="currentColor" opacity="0.35" />
              <path
                d="M12.5 7H17M15.2 4.8L17.2 7l-2 2.2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </template>
            <!-- 正换行：到头后拐到下一行 ↳ -->
            <template v-else-if="item.wrapIcon === 'wrap'">
              <rect x="0.5" y="0.5" width="3.2" height="5" rx="0.7" fill="currentColor" />
              <rect x="4.5" y="0.5" width="3.2" height="5" rx="0.7" fill="currentColor" opacity="0.65" />
              <rect x="0.5" y="8.5" width="3.2" height="5" rx="0.7" fill="currentColor" opacity="0.4" />
              <path
                d="M9 3h4.2a1.8 1.8 0 0 1 1.8 1.8V9.5M13.2 7.8L15 9.8l1.8-2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </template>
            <!-- 逆换行：到头后拐到上一行 ⤴ -->
            <template v-else>
              <rect x="0.5" y="8.5" width="3.2" height="5" rx="0.7" fill="currentColor" />
              <rect x="4.5" y="8.5" width="3.2" height="5" rx="0.7" fill="currentColor" opacity="0.65" />
              <rect x="0.5" y="0.5" width="3.2" height="5" rx="0.7" fill="currentColor" opacity="0.4" />
              <path
                d="M9 11h4.2a1.8 1.8 0 0 0 1.8-1.8V4.5M13.2 6.2L15 4.2l1.8 2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </template>
          </svg>
          <GrowIconify v-else-if="item.icon" :icon="item.icon" :size="14" />
          <span v-else class="element-display__text">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

defineOptions({ name: 'ElementDisplay' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
  elTagName: {
    type: String,
    default: '',
  },
})

const { styleOption, elTagName } = toRefs(props)

/** 仅标题 / 正文 / 短语 / 容器 / 链接 可设置布局模式 */
const LAYOUT_MODE_ALLOWED_TAGS = new Set([
  'BasicTitle',
  'p',
  'span',
  'div',
  'GrowLink',
  'GrowSwitch',
  'GrowColorPicker',
  'GrowDatePickerPanel',
  'GrowTransfer',
  'GrowTime',
  'GrowEllipsis',
])

const allowLayoutMode = computed(() => LAYOUT_MODE_ALLOWED_TAGS.has(elTagName.value))

type DirIcon = 'row' | 'row-reverse' | 'column' | 'column-reverse'
type WrapIcon = 'nowrap' | 'wrap' | 'wrap-reverse'

type OptionItem = {
  value: string
  tip: string
  icon?: string
  label?: string
  dirIcon?: DirIcon
  wrapIcon?: WrapIcon
}

type Section = {
  key: string
  label: string
  prop: string
  fallback: string
  when?: (style: Record<string, any>) => boolean
  options: OptionItem[]
}

/** 静态字符串便于 vite-plugin-purge-icons 收集 */
const ICON = {
  inline: 'carbon:name-space',
  flex: 'carbon:show-data-cards',
  block: 'carbon:group-resource',
  inlineBlock: 'carbon:thumbnail-2',
  justifyStart: 'carbon:align-horizontal-left',
  justifyEnd: 'carbon:align-horizontal-right',
  justifyCenter: 'carbon:align-horizontal-center',
  justifyBetween: 'carbon:pan-horizontal',
  justifyAround: 'carbon:pause',
  alignStart: 'carbon:align-vertical-top',
  alignEnd: 'carbon:align-vertical-bottom',
  alignCenter: 'carbon:align-vertical-center',
  alignBaseline: 'carbon:text-underline',
  alignStretch: 'carbon:join-right',
} as const

const allSections: Section[] = [
  {
    key: 'display',
    label: '显示类型',
    prop: 'display',
    fallback: 'block',
    options: [
      { value: 'inline', tip: '内部布局 inline', icon: ICON.inline },
      { value: 'flex', tip: '弹性布局 flex', icon: ICON.flex },
      { value: 'block', tip: '块级布局 block', icon: ICON.block },
      { value: 'inline-block', tip: '内联块布局 inline-block', icon: ICON.inlineBlock },
    ],
  },
  {
    key: 'flex-direction',
    label: '主轴方向',
    prop: 'flex-direction',
    fallback: 'row',
    when: (style) => style.display === 'flex',
    options: [
      { value: 'row', tip: '水平方向，起点在左侧', dirIcon: 'row' },
      { value: 'row-reverse', tip: '水平方向，起点在右侧', dirIcon: 'row-reverse' },
      { value: 'column', tip: '垂直方向，起点在上方', dirIcon: 'column' },
      { value: 'column-reverse', tip: '垂直方向，起点在下方', dirIcon: 'column-reverse' },
    ],
  },
  {
    key: 'justify-content',
    label: '主轴对齐',
    prop: 'justify-content',
    fallback: 'flex-start',
    when: (style) => style.display === 'flex',
    options: [
      { value: 'flex-start', tip: '左对齐', icon: ICON.justifyStart },
      { value: 'flex-end', tip: '右对齐', icon: ICON.justifyEnd },
      { value: 'center', tip: '水平居中', icon: ICON.justifyCenter },
      { value: 'space-between', tip: '两端对齐', icon: ICON.justifyBetween },
      { value: 'space-around', tip: '横向平分', icon: ICON.justifyAround },
    ],
  },
  {
    key: 'align-items',
    label: '辅轴对齐',
    prop: 'align-items',
    fallback: 'stretch',
    when: (style) => style.display === 'flex',
    options: [
      { value: 'flex-start', tip: '起点对齐', icon: ICON.alignStart },
      { value: 'flex-end', tip: '终点对齐', icon: ICON.alignEnd },
      { value: 'center', tip: '居中对齐', icon: ICON.alignCenter },
      { value: 'baseline', tip: '基线对齐', icon: ICON.alignBaseline },
      { value: 'stretch', tip: '占满容器高度', icon: ICON.alignStretch },
    ],
  },
  {
    key: 'flex-wrap',
    label: '换行',
    prop: 'flex-wrap',
    fallback: 'nowrap',
    when: (style) => style.display === 'flex',
    options: [
      { value: 'nowrap', tip: '不换行', wrapIcon: 'nowrap' },
      { value: 'wrap', tip: '正换行', wrapIcon: 'wrap' },
      { value: 'wrap-reverse', tip: '逆换行', wrapIcon: 'wrap-reverse' },
    ],
  },
]

const visibleSections = computed(() =>
  allSections.filter((section) => !section.when || section.when(styleOption.value)),
)

const isActive = (prop: string, value: string, fallback: string) => {
  return (styleOption.value[prop] || fallback) === value
}

const onStyleChange = (key: string, value: string) => {
  if (!allowLayoutMode.value) return

  const result = { ...styleOption.value }
  if (value) {
    result[key] = value
  } else {
    Reflect.deleteProperty(result, key)
  }
  if (key === 'display') {
    const inlineDisplays = ['inline', 'inline-block', 'inline-flex']
    if (value === 'flex') {
      if (!result['flex-direction']) result['flex-direction'] = 'row'
    } else {
      ;['flex-direction', 'justify-content', 'align-items', 'flex-wrap'].forEach((k) => {
        Reflect.deleteProperty(result, k)
      })
    }

    // 与 GrowLink 一致：行内级去掉撑满整行的 width:100%
    if (inlineDisplays.includes(value)) {
      if (result.width === '100%') Reflect.deleteProperty(result, 'width')
    } else if (
      (value === 'block' || value === 'flex') &&
      ['BasicTitle', 'p', 'div'].includes(elTagName.value) &&
      (result.width == null || result.width === '')
    ) {
      // 切回块级时恢复默认占满（标题 / 正文 / 容器）
      result.width = '100%'
    }
  }
  emit('update:styleOption', result)
}
</script>

<style lang="scss" scoped>
.element-display {
  padding: 5px 10px 12px;
}

.element-display__section {
  & + & {
    margin-top: 4px;
  }
}

.element-display__label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 22px;
  color: var(--text-color-secondary, #909399);
}

.element-display__group {
  display: flex;
  width: 100%;
}

.element-display__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--layout-border-color, #dcdfe6);
  border-left-width: 0;
  background: var(--component-background-color, #fff);
  color: var(--text-color, #606266);
  line-height: 0;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;

  &:first-child {
    border-left-width: 1px;
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover:not(.is-active) {
    color: var(--primary-color);
    z-index: 1;
  }

  &.is-active {
    z-index: 2;
    color: #fff;
    background: var(--primary-color);
    border-color: var(--primary-color);
  }

  /* Iconify / 自定义图标统一居中 */
  :deep(svg),
  :deep(.iconify) {
    display: block;
    margin: auto;
    flex-shrink: 0;
  }
}

.element-display__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

/* 主轴方向示意图：三色块表示子项，高亮块表示起点 */
.element-display__dir {
  display: inline-flex;
  align-items: stretch;
  justify-content: stretch;
  box-sizing: border-box;
  width: 16px;
  height: 14px;
  margin: auto;
  gap: 2px;
  flex-shrink: 0;

  i {
    display: block;
    flex: 1;
    min-width: 0;
    min-height: 0;
    border-radius: 1px;
    background: currentColor;
    opacity: 0.32;
  }

  i:first-child {
    opacity: 1;
  }

  &.is-row {
    flex-direction: row;
  }

  &.is-row-reverse {
    flex-direction: row-reverse;
  }

  &.is-column {
    flex-direction: column;
  }

  &.is-column-reverse {
    flex-direction: column-reverse;
  }
}

.element-display__wrap-svg {
  display: block;
  flex-shrink: 0;
  margin: auto;
  overflow: visible;
}
</style>
