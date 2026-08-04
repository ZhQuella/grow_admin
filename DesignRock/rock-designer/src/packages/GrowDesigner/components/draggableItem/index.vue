<template>
  <div
    class="draggable-item"
    :class="{
      'is-active': isActived,
      'is-idle': !isActived,
      'is-inline-level': isInlineLevel,
      'has-frame-size': hasFrameSize,
      'has-explicit-height': hasExplicitHeight,
      'is-design-invisible': !designVisible,
      'is-design-unrendered': !designRenderable,
    }"
    :style="frameStyle"
    @click.stop="onActiveStructure"
  >
    <div
      v-if="!designVisible || !designRenderable"
      class="draggable-item__flags"
    >
      <span v-if="!designVisible" class="draggable-item__flag is-invisible">不显示</span>
      <span v-if="!designRenderable" class="draggable-item__flag is-unrendered">不渲染</span>
    </div>
    <div v-show="isActived" class="draggable-item__toolbar">
      <GrowIconify
        class="draggable-content-bar draggable-item__action is-handle"
        icon="carbon:move"
        :size="14"
        title="拖拽排序"
      />
      <GrowIconify
        v-if="isOverlayHost"
        class="draggable-item__action"
        icon="carbon:launch"
        :size="14"
        hover-pointer
        :title="overlayOpenTitle"
        @click.stop="onOpenOverlayEditor"
      />
      <GrowIconify
        class="draggable-item__action"
        icon="carbon:copy"
        :size="14"
        hover-pointer
        title="复制"
        @click.stop="onCopyItem"
      />
      <GrowIconify
        v-if="isAdd"
        class="draggable-item__action"
        icon="carbon:add-alt"
        :size="14"
        hover-pointer
        title="添加子项"
        @click.stop="onAddSpecificChild"
      />
      <GrowIconify
        class="draggable-item__action is-danger"
        icon="carbon:trash-can"
        :size="14"
        hover-pointer
        title="删除"
        @click.stop="onDeleteItem"
      />
    </div>
    <div class="draggable-item__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import {
  ACTIVE_UUID,
  DRAGGABLE_CONGIG,
  GROW_RUNTIME_STATE,
  OVERLAY_EDIT_UUID,
} from '../../config/designation'
import { inject, computed, toRefs } from 'vue'
import {
  buildRuntimeState,
  coerceBool,
  resolveBoundProps,
} from '../../../GrowRenderer/utils/resolveBoundProps'

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>
const overlayEditUUID = inject(OVERLAY_EDIT_UUID, null) as Ref<string> | null
const injectedRuntimeState = inject<Record<string, unknown> | null>(
  GROW_RUNTIME_STATE,
  null,
)

/** 外框同步的尺寸相关样式 */
const FRAME_SIZE_KEYS = [
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
] as const

const INLINE_DISPLAYS = new Set(['inline', 'inline-block', 'inline-flex'])
const BLOCK_DISPLAYS = new Set(['block', 'flex', 'grid', 'flow-root', 'table'])

/** 支持布局模式且需外框 inline-block / 内部保持原 display 的组件 */
const INLINE_FRAME_TAGS = new Set([
  'BasicTitle',
  'p',
  'span',
  'div',
  'GrowLink',
  'GrowSwitch',
  'GrowTime',
  'GrowEllipsis',
  'GrowTooltip',
  'GrowPopover',
  'GrowSearchBar',
  'GrowColumnBar',
  'GrowUpload',
  'GrowAvatar',
  'GrowIconify',
])

interface Props {
  structure: any
  config?: any
}

const emit = defineEmits(['special', 'active', 'delete', 'copy'])

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  structure: () => ({}),
})
const { structure } = toRefs(props)

const uuid = computed(() => structure?.value?.uuid)

const currentArgument = computed(() => {
  const { renderArgument } = draggableConfig
  return renderArgument[uuid?.value] || {}
})

const currentStyles = computed(() => {
  if (!uuid.value) return {}
  return draggableConfig.styles?.[uuid.value] || {}
})

/** 设计态：解析显示/渲染开关，仅做标记不真正隐藏 */
const designVisibility = computed(() => {
  const id = uuid.value
  if (!id || !draggableConfig) {
    return { visible: true, render: true }
  }
  const state =
    injectedRuntimeState ??
    buildRuntimeState(draggableConfig.dataSource, draggableConfig.computedProps)
  const resolved = resolveBoundProps(
    draggableConfig.props?.[id] || {},
    draggableConfig.propBindModes?.[id],
    state,
  )
  return {
    visible: coerceBool(resolved.visible, true),
    render: coerceBool(resolved.render, true),
  }
})
const designVisible = computed(() => designVisibility.value.visible)
const designRenderable = computed(() => designVisibility.value.render)

const isOverlayHost = computed(() => {
  const tag = currentArgument.value?.elTagName
  return tag === 'GrowModal' || tag === 'GrowDrawer'
})

/** 滚动条：高度由组件 props 控制，不重复写到外框（避免与 body padding 叠加）
 * 弹窗/抽屉：样式作用在真实组件（及模拟编辑层）上，不作用在画布占位外框
 */
const effectiveFrameStyles = computed(() => {
  if (isOverlayHost.value) return {}
  return { ...currentStyles.value }
})

const isAdd = computed(() => currentArgument?.value?.isAdd)

const overlayOpenTitle = computed(() =>
  currentArgument.value?.elTagName === 'GrowDrawer' ? '打开抽屉编辑' : '打开弹窗编辑',
)

const onOpenOverlayEditor = () => {
  if (!overlayEditUUID || !uuid.value) return
  overlayEditUUID.value = uuid.value
  activeUUID.value = uuid.value
}

const isInlineBlockDefault = computed(() => Boolean(currentArgument?.value?.isInlineBlock))

const styleDisplay = computed(() => {
  const value = currentStyles.value?.display
  return value == null || value === '' ? '' : String(value)
})

/**
 * 外框是否按行内级排布：
 * - 标题/正文/短语/容器/链接 且 display 为 inline* → 外框 inline-block
 * - 未设置 display 时回退 isInlineBlock（如 span / 链接默认）
 */
const isInlineLevel = computed(() => {
  const display = styleDisplay.value
  const tag = currentArgument.value?.elTagName
  const allowFrame = INLINE_FRAME_TAGS.has(tag) || isInlineBlockDefault.value

  if (INLINE_DISPLAYS.has(display)) {
    return allowFrame || isInlineBlockDefault.value
  }
  if (BLOCK_DISPLAYS.has(display)) return false
  return isInlineBlockDefault.value
})

const hasFrameSize = computed(() =>
  FRAME_SIZE_KEYS.some((key) => {
    const value = effectiveFrameStyles.value[key]
    return value != null && value !== ''
  }),
)

/** 仅显式设置了 height 时，body 才铺满高度；仅有 min-height 时应随内容撑开 */
const hasExplicitHeight = computed(() => {
  const value = effectiveFrameStyles.value.height
  return value != null && value !== ''
})

const frameStyle = computed(() => {
  const styles = effectiveFrameStyles.value
  const result: Record<string, string> = {
    'box-sizing': 'border-box',
  }

  const display = styleDisplay.value
  const tag = currentArgument.value?.elTagName
  const isInlineFrame =
    INLINE_DISPLAYS.has(display) &&
    (INLINE_FRAME_TAGS.has(tag) || isInlineBlockDefault.value)

  // 映射组件外层：与 GrowLink 一致，行内级用 inline-block + fit-content
  if (isInlineFrame) {
    result.display = 'inline-block'
    result['vertical-align'] = 'top'
    result.width = 'fit-content'
    result['max-width'] = '100%'
  } else if (BLOCK_DISPLAYS.has(display)) {
    result.display = 'block'
  }

  const rawWidth = styles.width
  const isFullWidth = rawWidth === '100%'

  if (!hasFrameSize.value) {
    return result.display || result.width ? result : undefined
  }

  for (const key of FRAME_SIZE_KEYS) {
    const value = styles[key]
    if (value == null || value === '') continue
    // 行内级不把 width:100% 同步到外框（否则仍占满整行）
    if (key === 'width' && isInlineFrame && isFullWidth) continue
    if (key === 'width' && isInlineFrame) {
      // 用户显式设了具体宽度时才覆盖 fit-content
      result.width = value
      continue
    }
    // 布局容器 height:100% 相对舞台实测高度，避免父级仅有 min-height 时塌陷
    if (
      key === 'height' &&
      tag === 'GrowLayout' &&
      (value === '100%' || value === '100vh')
    ) {
      result.height = 'var(--designer-stage-height, 100%)'
      continue
    }
    result[key] = value
  }
  if (result.width && result.width !== 'fit-content' && result['min-width'] == null) {
    result['min-width'] = '0'
  }
  if (result.height && result['min-height'] == null) {
    result['min-height'] = '0'
  }
  return result
})

const isActived = computed(() => activeUUID.value === uuid.value)

const onActiveStructure = () => {
  emit('active', uuid.value)
}

const onAddSpecificChild = () => {
  emit('special', {
    structure: props.structure,
    renderArgument: currentArgument.value,
  })
}

const onDeleteItem = () => {
  emit('delete', props.structure)
}

const onCopyItem = () => {
  emit('copy', props.structure)
}
</script>

<style lang="scss" scoped>
.draggable-item {
  position: relative;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background: var(--component-background-color);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &.is-inline-level {
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    min-height: 0;

    /* body 也必须 fit-content：普通 block 会按包含块撑满整行 */
    .draggable-item__body {
      display: inline-block;
      vertical-align: top;
      box-sizing: border-box;
      width: fit-content;
      max-width: 100%;
      min-width: 0;
      min-height: 0;
      padding: 6px 8px;
    }
  }

  /* 仅在有显式尺寸且非行内级时，让 body 铺满外框 */
  &.has-frame-size:not(.is-inline-level) {
    min-width: 0;
    min-height: 0;

    .draggable-item__body {
      width: 100%;
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
    }

    /* 只有明确设置了 height 才让 body 高度 100%，避免仅 min-height 时文字被裁切 */
    &.has-explicit-height .draggable-item__body {
      height: 100%;
    }
  }

  &.has-frame-size.is-inline-level {
    min-width: 0;
    min-height: 0;

    .draggable-item__body {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
  }

  &.is-idle:hover {
    border-color: var(--color-primary-a28);
  }

  &.is-active {
    border-color: var(--primary-color);
    border-style: solid;
    box-shadow: 0 0 0 1px var(--color-primary-a16);
  }

  /* 设计态：不显示（v-show=false） */
  &.is-design-invisible {
    opacity: 0.55;
    border-style: dotted;
    border-color: #e6a23c;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 6px,
      rgba(230, 162, 60, 0.08) 6px,
      rgba(230, 162, 60, 0.08) 12px
    );
  }

  /* 设计态：不渲染（v-if=false） */
  &.is-design-unrendered {
    opacity: 0.5;
    border-style: dashed;
    border-color: #909399;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 6px,
      rgba(144, 147, 153, 0.12) 6px,
      rgba(144, 147, 153, 0.12) 12px
    );
  }

  &.is-design-invisible.is-design-unrendered {
    border-color: #f56c6c;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 6px,
      rgba(245, 108, 108, 0.1) 6px,
      rgba(245, 108, 108, 0.1) 12px
    );
  }
}

.draggable-item__flags {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 15;
  display: inline-flex;
  gap: 4px;
  padding: 2px 4px;
  pointer-events: none;
}

.draggable-item__flag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 0 0 0 6px;
  font-size: 11px;
  line-height: 18px;
  color: #fff;
  white-space: nowrap;

  &.is-invisible {
    background: #e6a23c;
  }

  &.is-unrendered {
    background: #909399;
  }
}

.draggable-item.is-design-invisible.is-design-unrendered .draggable-item__flag.is-unrendered {
  background: #f56c6c;
}

.draggable-item__body {
  padding: 6px;
  box-sizing: border-box;
  /* 操作区禁止组件交互，仅预览可操作 */
  pointer-events: none;
  user-select: none;

  :deep(*) {
    pointer-events: none !important;
    user-select: none !important;
  }

  /* 投放区、子节点外框与工具栏需可点选 / 拖入 */
  :deep(.draggable-item),
  :deep(.draggable-grop-wrap),
  :deep(.grow-logic-block),
  :deep(.draggable-item__toolbar),
  :deep(.draggable-item__toolbar *),
  :deep(.draggable-item__flags),
  :deep(.draggable-item__flag) {
    pointer-events: auto !important;
  }

  :deep(.draggable-item__flags),
  :deep(.draggable-item__flag) {
    pointer-events: none !important;
  }
}

.draggable-item__toolbar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 26px;
  padding: 0 4px 0 2px;
  border-radius: 0 0 8px 0;
  background: var(--primary-color);
  color: #fff;
}

.draggable-item__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  color: #fff;
  opacity: 0.92;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    opacity: 1;
  }

  &.is-handle {
    cursor: grab;
  }

  &.is-danger:hover {
    background: rgba(237, 111, 111, 0.35);
  }
}
</style>
