<template>
  <div class="element-text">
    <!-- 颜色 + 透明度 -->
    <div class="element-text__row">
      <label class="element-text__color">
        <span class="element-text__swatch-wrap">
          <span
            class="element-text__swatch-fill"
            :style="{ backgroundColor: cssColor || DEFAULT_TEXT_COLOR }"
          />
          <input
            class="element-text__swatch"
            type="color"
            :value="hexValue"
            @input="onColorPick"
          />
        </span>
        <GrowInput
          class="element-text__hex"
          size="small"
          placeholder="101010"
          :model-value="hexText"
          @update:model-value="onColorText"
        />
      </label>
      <label class="element-text__alpha">
        <GrowInputNumber
          class="element-text__alpha-input"
          size="small"
          :min="0"
          :max="100"
          :controls="false"
          :model-value="alphaPercent"
          @update:model-value="onAlphaChange"
        />
        <span class="element-text__unit">%</span>
      </label>
    </div>

    <!-- 字号 + B/I/U/S -->
    <div class="element-text__row">
      <GrowInputNumber
        class="element-text__size"
        size="small"
        :min="8"
        :max="200"
        :controls="false"
        :model-value="fontSize"
        @update:model-value="onFontSizeChange"
      />
      <div class="element-text__group">
        <button
          v-for="item in FONT_STYLE_TOGGLES"
          :key="item.key"
          type="button"
          class="element-text__toggle"
          :class="[
            `is-${item.key}`,
            { 'is-active': isStyleActive(item.key) },
          ]"
          :title="item.tip"
          @click="toggleFontStyle(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 水平 / 垂直对齐 -->
    <div class="element-text__row element-text__row--align">
      <div class="element-text__group">
        <button
          v-for="item in TEXT_ALIGN_OPTIONS"
          :key="item.value"
          type="button"
          class="element-text__icon-btn"
          :class="{ 'is-active': textAlign === item.value }"
          :title="item.tip"
          @click="onTextAlign(item.value)"
        >
          <GrowIconify :icon="item.icon" :size="14" />
        </button>
      </div>
      <div class="element-text__group">
        <button
          v-for="item in VERTICAL_ALIGN_OPTIONS"
          :key="item.value"
          type="button"
          class="element-text__icon-btn"
          :class="{ 'is-active': verticalAlign === item.value }"
          :title="item.tip"
          @click="onVerticalAlign(item.value)"
        >
          <GrowIconify :icon="item.icon" :size="14" />
        </button>
      </div>
    </div>

    <!-- 字距 / 行高 / 更多 -->
    <div class="element-text__row">
      <label class="element-text__metric" title="字间距">
        <span class="element-text__metric-cluster">
          <GrowIconify icon="carbon:text-tracking" :size="14" />
          <GrowInputNumber
            class="element-text__metric-input"
            size="small"
            :min="-50"
            :max="100"
            :controls="false"
            :model-value="letterSpacing"
            @update:model-value="onLetterSpacing"
          />
        </span>
      </label>
      <label class="element-text__metric" title="行高">
        <span class="element-text__metric-cluster">
          <GrowIconify icon="carbon:text-leading" :size="14" />
          <GrowInputNumber
            class="element-text__metric-input"
            size="small"
            :min="0"
            :max="200"
            :controls="false"
            :model-value="lineHeight"
            @update:model-value="onLineHeight"
          />
        </span>
      </label>
      <GrowPopover
        v-model:visible="moreVisible"
        trigger="click"
        placement="bottom-end"
        :width="280"
      >
        <template #reference>
          <button type="button" class="element-text__more" title="更多文本设置">
            <GrowIconify icon="carbon:overflow-menu-horizontal" :size="16" />
          </button>
        </template>
        <TextMorePanel
          :style-option="styleOption"
          @update:style-option="(v) => emit('update:styleOption', v)"
          @close="moreVisible = false"
        />
      </GrowPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import TextMorePanel from './TextMorePanel.vue'
import {
  DEFAULT_TEXT_COLOR,
  FONT_STYLE_TOGGLES,
  TEXT_ALIGN_OPTIONS,
  VERTICAL_ALIGN_OPTIONS,
} from './constants'
import { useTextStyle } from './use/useTextStyle'

defineOptions({ name: 'ElementText' })

const emit = defineEmits(['update:styleOption'])

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)
const moreVisible = ref(false)

const {
  cssColor,
  hexValue,
  hexText,
  alphaPercent,
  onColorPick,
  onColorText,
  onAlphaChange,
  fontSize,
  onFontSizeChange,
  isStyleActive,
  toggleFontStyle,
  textAlign,
  verticalAlign,
  onTextAlign,
  onVerticalAlign,
  letterSpacing,
  lineHeight,
  onLetterSpacing,
  onLineHeight,
} = useTextStyle(styleOption, emit)
</script>

<style lang="scss" scoped>
.element-text {
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-text__row {
  display: flex;
  align-items: center;
  gap: 8px;

  &--align {
    justify-content: space-between;
  }
}

.element-text__color {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
}

.element-text__swatch-wrap {
  position: relative;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #e4e7ed);
  border-radius: 4px;
}

.element-text__swatch-fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.element-text__swatch {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
}

.element-text__hex {
  flex: 1;
  min-width: 0;
}

.element-text__alpha {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
  width: 72px;
  margin: 0;
}

.element-text__alpha-input,
.element-text__size {
  width: 56px;
}

.element-text__unit {
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.element-text__group {
  display: inline-flex;
  gap: 2px;
  margin-left: auto;
}

.element-text__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-color, #606266);
  cursor: pointer;

  &.is-italic {
    font-style: italic;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 500;
  }

  &.is-underline {
    text-decoration: underline;
    font-weight: 600;
  }

  &.is-strike {
    text-decoration: line-through;
    font-weight: 600;
  }

  &:hover:not(.is-active) {
    background: #f2f3f5;
  }

  &.is-active {
    background: #e8e9eb;
    color: var(--text-color, #303133);
  }
}

.element-text__icon-btn,
.element-text__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color, #606266);
  line-height: 0;
  cursor: pointer;

  :deep(.grow-iconify),
  :deep(svg),
  :deep(.iconify) {
    display: block;
    margin: auto;
    flex-shrink: 0;
    line-height: 0;
  }

  &:hover:not(.is-active) {
    background: #f2f3f5;
  }

  &.is-active {
    background: #e8e9eb;
    color: var(--text-color, #303133);
  }
}

.element-text__metric {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  margin: 0;
  color: var(--text-color-secondary, #909399);
}

.element-text__metric-cluster {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  width: fit-content;
  max-width: 100%;

  :deep(.grow-iconify),
  :deep(svg),
  :deep(.iconify) {
    display: block;
    flex-shrink: 0;
    line-height: 0;
  }
}

.element-text__metric-input {
  flex: none;
  width: 44px !important;
  min-width: 44px !important;
  max-width: 44px !important;
  line-height: normal;

  :deep(.el-input-number),
  :deep(.el-input),
  :deep(.el-input__wrapper),
  :deep(.n-input-number),
  :deep(.n-input),
  :deep(.ant-input-number) {
    width: 44px !important;
    min-width: 44px !important;
  }

  :deep(.el-input__inner),
  :deep(input) {
    padding-left: 4px;
    padding-right: 4px;
    text-align: left;
  }
}

.element-text__more:hover {
  background: #f2f3f5;
}

</style>
