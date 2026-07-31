<template>
  <div class="text-more-panel">
    <header class="text-more-panel__header">
      <span class="text-more-panel__title">文本设置</span>
      <button type="button" class="text-more-panel__close" title="关闭" @click="emit('close')">
        <GrowIconify icon="carbon:close" :size="16" />
      </button>
    </header>

    <div class="text-more-panel__row">
      <span class="text-more-panel__label">自动/固定</span>
      <div class="text-more-panel__group">
        <button
          v-for="item in RESIZE_MODE_OPTIONS"
          :key="item.value"
          type="button"
          class="text-more-panel__btn"
          :class="{ 'is-active': resizeMode === item.value }"
          :title="item.tip"
          @click="onResizeMode(item.value)"
        >
          <GrowIconify :icon="item.icon" :size="14" />
        </button>
      </div>
    </div>

    <div class="text-more-panel__row">
      <span class="text-more-panel__label">文本排列</span>
      <div class="text-more-panel__group">
        <button
          v-for="item in WRITING_MODE_OPTIONS"
          :key="item.value"
          type="button"
          class="text-more-panel__btn"
          :class="{ 'is-active': writingMode === item.value }"
          :title="item.tip"
          @click="onWritingMode(item.value)"
        >
          <GrowIconify :icon="item.icon" :size="14" />
        </button>
      </div>
    </div>

    <div class="text-more-panel__row">
      <span class="text-more-panel__label">列表样式</span>
      <div class="text-more-panel__group">
        <button
          v-for="item in LIST_STYLE_OPTIONS"
          :key="item.value"
          type="button"
          class="text-more-panel__btn"
          :class="{ 'is-active': listStyle === item.value }"
          :title="item.tip"
          @click="onListStyle(item.value)"
        >
          <GrowIconify :icon="item.icon" :size="14" />
        </button>
      </div>
    </div>

    <div class="text-more-panel__row">
      <span class="text-more-panel__label">段间距</span>
      <GrowInputNumber
        class="text-more-panel__number"
        size="small"
        :min="0"
        :max="200"
        :controls="false"
        :model-value="paragraphSpacing"
        @update:model-value="onParagraphSpacing"
      />
    </div>

    <div class="text-more-panel__row">
      <span class="text-more-panel__label">裁剪文本</span>
      <GrowSwitch :model-value="clipText" @update:model-value="onClipText" />
    </div>

    <div class="text-more-panel__row text-more-panel__row--padding">
      <span class="text-more-panel__label">边距</span>
      <div class="text-more-panel__padding">
        <label v-for="side in PADDING_SIDES" :key="side.key" class="text-more-panel__pad-item">
          <GrowInputNumber
            class="text-more-panel__pad-input"
            size="small"
            :min="0"
            :max="200"
            :controls="false"
            :model-value="paddingValue(side.key)"
            @update:model-value="(v) => onPadding(side.key, v)"
          />
          <span class="text-more-panel__pad-label">{{ side.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import {
  LIST_STYLE_OPTIONS,
  RESIZE_MODE_OPTIONS,
  WRITING_MODE_OPTIONS,
} from './constants'
import { useTextMore } from './use/useTextMore'

defineOptions({ name: 'TextMorePanel' })

const emit = defineEmits<{
  close: []
  'update:styleOption': [value: Record<string, any>]
}>()

const props = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})

const { styleOption } = toRefs(props)

const {
  resizeMode,
  onResizeMode,
  writingMode,
  onWritingMode,
  listStyle,
  onListStyle,
  paragraphSpacing,
  onParagraphSpacing,
  clipText,
  onClipText,
  paddingValue,
  onPadding,
} = useTextMore(styleOption, emit)

const PADDING_SIDES = [
  { key: 'top', label: '上' },
  { key: 'bottom', label: '下' },
  { key: 'left', label: '左' },
  { key: 'right', label: '右' },
]
</script>

<style lang="scss" scoped>
.text-more-panel {
  width: 260px;
  padding: 4px 0 8px;
}

.text-more-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 12px;
}

.text-more-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.text-more-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #909399);
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

  &:hover {
    color: var(--text-color, #303133);
    background: var(--header-action-hover-bg-color);
  }
}

.text-more-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 4px 12px;

  &--padding {
    align-items: flex-start;
    padding-top: 8px;
  }
}

.text-more-panel__label {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-color, #606266);
}

.text-more-panel__group {
  display: inline-flex;
  gap: 4px;
}

.text-more-panel__btn {
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
    background: var(--header-action-hover-bg-color);
  }

  &.is-active {
    background: var(--color-primary-a12);
    color: var(--text-color, #303133);
  }
}

.text-more-panel__number {
  width: 64px;
}

.text-more-panel__padding {
  display: flex;
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
}

.text-more-panel__pad-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  margin: 0;

  & + & {
    border-left: 1px solid var(--layout-border-color, #dcdfe6);
  }
}

.text-more-panel__pad-input {
  width: 100%;
}

.text-more-panel__pad-label {
  padding-bottom: 2px;
  font-size: 11px;
  line-height: 16px;
  color: var(--text-color-secondary, #909399);
}
</style>
