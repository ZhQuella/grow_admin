<template>
  <div class="style-config">
    <section
      v-for="group in visibleGroups"
      :key="group.key"
      class="style-config__group"
    >
      <header class="style-config__header">
        <div class="style-config__title-row">
          <h4 class="style-config__title">{{ group.title }}</h4>
          <GrowTooltip v-if="group.describe" :content="group.describe" placement="left">
            <span class="style-config__help">
              <GrowIconify icon="carbon:help" :size="14" />
            </span>
          </GrowTooltip>
        </div>
        <p v-if="group.summary" class="style-config__summary">{{ group.summary }}</p>
      </header>
      <div class="style-config__body">
        <component
          :is="group.component"
          :styleOption="currentStylesConfig"
          :elTagName="currentBasicConfig?.elTagName"
          @update:styleOption="onUpdateStyle"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ElementSize from '../../optionComponent/ElementSize/index.vue'
import ElementRadius from '../../optionComponent/ElementRadius/index.vue'
import ElementBorder from '../../optionComponent/ElementBorder/index.vue'
import ElementBackground from '../../optionComponent/ElementBackground/index.vue'
import ElementShadow from '../../optionComponent/ElementShadow/index.vue'
import ElementDisplay from '../../optionComponent/ElementDisplay/index.vue'

defineOptions({ name: 'styleConfig' })

const emit = defineEmits<{
  'update:currentStylesConfig': [value: Record<string, any>]
}>()

const props = defineProps({
  currentStylesConfig: {
    type: Object,
    default: () => ({}),
  },
  currentBasicConfig: {
    type: Object,
    default: () => ({}),
  },
})

/** 与 ElementDisplay 保持一致：仅部分组件可配布局模式 */
const LAYOUT_MODE_ALLOWED_TAGS = new Set([
  'BasicTitle',
  'p',
  'span',
  'div',
  'GrowLink',
  'GrowSwitch',
  'GrowRadio',
  'GrowCheckbox',
  'GrowTime',
  'GrowEllipsis',
])

/** 仅标题 / 正文 / 短语 / 容器可配背景色 */
const BACKGROUND_ALLOWED_TAGS = new Set(['BasicTitle', 'p', 'span', 'div'])

/** 仅图片 / 标题 / 正文 / 短语 / 容器可配边框 */
const BORDER_ALLOWED_TAGS = new Set(['img', 'BasicTitle', 'p', 'span', 'div'])

/** 阴影与边框同一批元素 */
const SHADOW_ALLOWED_TAGS = BORDER_ALLOWED_TAGS

const styleGroups = [
  {
    key: 'size',
    title: '尺寸与间距',
    summary: '调整宽高、外边距与内边距',
    describe: '宽高控制元素尺寸；Margin 为外边距，Padding 为内边距。可切换 px / % / vw·vh 单位。',
    component: ElementSize,
    visible: () => true,
  },
  {
    key: 'radius',
    title: '圆角',
    summary: '设置四角圆角半径',
    describe: '可为四个角分别设置圆角，或开启联动统一控制。数值单位为 px。',
    component: ElementRadius,
    visible: () => true,
  },
  {
    key: 'border',
    title: '边框',
    summary: '设置边框颜色、线型与宽度',
    describe: '仅图片、标题、正文、短语、容器支持。可调节颜色与透明度、线型与宽度；点击右侧图标可切换四边独立设置。',
    component: ElementBorder,
    visible: () => BORDER_ALLOWED_TAGS.has(props.currentBasicConfig?.elTagName),
  },
  {
    key: 'background',
    title: '背景颜色',
    summary: '设置元素背景色',
    describe: '仅标题、正文、短语、容器支持。可通过色板或十六进制设置颜色，并调节透明度（0–100%）。',
    component: ElementBackground,
    visible: () => BACKGROUND_ALLOWED_TAGS.has(props.currentBasicConfig?.elTagName),
  },
  {
    key: 'shadow',
    title: '阴影',
    summary: '设置阴影颜色与透明度',
    describe: '仅图片、标题、正文、短语、容器支持。通过色板或十六进制设置阴影颜色，并调节透明度（0–100%）。',
    component: ElementShadow,
    visible: () => SHADOW_ALLOWED_TAGS.has(props.currentBasicConfig?.elTagName),
  },
  {
    key: 'display',
    title: '布局模式',
    summary: '设置 display 及 flex 布局',
    describe: '仅标题、正文、短语、容器、链接支持。可选 inline / block / inline-block / flex；flex 时可继续配置主轴、对齐与换行。',
    component: ElementDisplay,
    visible: () => LAYOUT_MODE_ALLOWED_TAGS.has(props.currentBasicConfig?.elTagName),
  },
]

const visibleGroups = computed(() => styleGroups.filter((group) => group.visible()))

const onUpdateStyle = (value: Record<string, any>) => {
  emit('update:currentStylesConfig', value)
}
</script>

<style lang="scss" scoped>
.style-config {
  padding: 4px 0 16px;
}

.style-config__group {
  & + & {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--layout-border-color, #ebeef5);
  }
}

.style-config__header {
  padding: 10px 12px 0;
}

.style-config__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.style-config__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  color: var(--text-color, #303133);
}

.style-config__help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary, #909399);
  cursor: help;

  &:hover {
    color: var(--primary-color);
  }
}

.style-config__summary {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-color-secondary, #909399);
}

.style-config__body {
  :deep(.element-size),
  :deep(.element-radius),
  :deep(.element-border),
  :deep(.element-background),
  :deep(.element-shadow),
  :deep(.element-display) {
    padding-top: 8px;
  }
}
</style>
