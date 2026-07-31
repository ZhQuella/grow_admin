<template>
  <div
    v-if="visible"
    class="overlay-editor"
    @click.stop
    @mouseup.stop
  >
    <div class="overlay-editor__mask" @click="onClose" />
    <div
      class="overlay-editor__panel"
      :class="[
        {
          'is-modal': isModal,
          'is-drawer': isDrawer,
          [`is-drawer-${direction}`]: isDrawer,
        },
        overlayClass,
      ]"
      :style="panelStyle"
    >
      <div class="overlay-editor__header">
        <div class="overlay-editor__title">{{ title }}</div>
        <button
          v-if="showClose"
          type="button"
          class="overlay-editor__close"
          title="关闭编辑"
          @click="onClose"
        >
          ×
        </button>
      </div>
      <div class="overlay-editor__body">
        <draggable
          group="draggable-group"
          :animation="200"
          item-key="uuid"
          :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: 'draggable-group',
          }"
          :disabled="false"
          ghost-class="ghost"
          chosen-class="chosen-item"
          drag-class="drag-item"
          class="draggable-grop-wrap overlay-editor__drop"
          handle=".draggable-content-bar"
          v-model="structure.children"
          @add="onChildAdd"
        >
          <template #item="{ element }">
            <DraggableItem
              :structure="element"
              @active="onActive"
              @delete="onDelete"
              @copy="onCopy"
              @special="onSpecial"
            >
              <abstractionComponent
                :config="draggableConfig.renderArgument[element.uuid]"
                :propsInfo="draggableConfig.props[element.uuid]"
                :draggable-config="draggableConfig"
                :structure="element"
                @add="onNestedAdd"
                @special="onSpecial"
                @delete="onDelete"
                @copy="onCopy"
                @active="onActive"
              />
            </DraggableItem>
          </template>
        </draggable>
      </div>
      <div v-if="showFooter" class="overlay-editor__footer">
        <draggable
          group="draggable-group"
          :animation="200"
          item-key="uuid"
          :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: 'draggable-group',
          }"
          :disabled="false"
          ghost-class="ghost"
          chosen-class="chosen-item"
          drag-class="drag-item"
          class="draggable-grop-wrap overlay-editor__drop is-footer"
          handle=".draggable-content-bar"
          v-model="structure.footerSlot"
          @add="onFooterChildAdd"
        >
          <template #item="{ element }">
            <DraggableItem
              :structure="element"
              @active="onActive"
              @delete="onDelete"
              @copy="onCopy"
              @special="onSpecial"
            >
              <abstractionComponent
                :config="draggableConfig.renderArgument[element.uuid]"
                :propsInfo="draggableConfig.props[element.uuid]"
                :draggable-config="draggableConfig"
                :structure="element"
                @add="onNestedAdd"
                @special="onSpecial"
                @delete="onDelete"
                @copy="onCopy"
                @active="onActive"
              />
            </DraggableItem>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import draggable from 'vuedraggable'
import { findByUUID } from '@grow-admin-rock/utils'
import { GROW_RUNTIME_STATE } from '../../config/designation'
import {
  buildRuntimeState,
  resolveBoundProps,
} from '../../../GrowRenderer/utils/resolveBoundProps'
import {
  resolveNodeClass,
  resolveOverlayHostStyle,
} from '../../../GrowRenderer/utils/normalizeProps'
import DraggableItem from '../draggableItem/index.vue'
import abstractionComponent from '../abstractionComponent/index.vue'

defineOptions({ name: 'OverlayEditor' })

const props = defineProps<{
  uuid: string
  draggableConfig: any
}>()

const emit = defineEmits<{
  close: []
  add: [payload: any]
  special: [payload: any]
  delete: [payload: any]
  copy: [payload: any]
  active: [payload: any]
}>()

const injectedRuntimeState = inject<Record<string, unknown> | null>(
  GROW_RUNTIME_STATE,
  null,
)

const structure = computed(() => {
  const node = findByUUID(props.draggableConfig.structures || [], props.uuid)
  if (node) {
    if (!Array.isArray(node.children)) node.children = []
    if (!Array.isArray(node.footerSlot)) node.footerSlot = []
  }
  return node
})

const visible = computed(() => Boolean(props.uuid && structure.value))

const config = computed(
  () => props.draggableConfig.renderArgument?.[props.uuid] || {},
)
const propsInfo = computed(() => props.draggableConfig.props?.[props.uuid] || {})
/** 显式依赖 styles 引用，保证样式面板改动能刷新模拟层 */
const rawStyles = computed(
  () => props.draggableConfig.styles?.[props.uuid] || {},
)
const resolvedPropsInfo = computed(() =>
  resolveBoundProps(
    propsInfo.value,
    props.draggableConfig.propBindModes?.[props.uuid],
    injectedRuntimeState ??
      buildRuntimeState(
        props.draggableConfig.dataSource,
        props.draggableConfig.computedProps,
      ),
  ),
)

const isModal = computed(() => config.value.elTagName === 'GrowModal')
const isDrawer = computed(() => config.value.elTagName === 'GrowDrawer')
const direction = computed(() => propsInfo.value.direction || 'rtl')
const title = computed(
  () =>
    resolvedPropsInfo.value.title ||
    (isModal.value ? '弹窗标题' : '抽屉标题'),
)
const showClose = computed(() => propsInfo.value['show-close'] !== false)
const showFooter = computed(() => Boolean(propsInfo.value.showFooter))

const overlayClass = computed(() => resolveNodeClass(rawStyles.value))

/**
 * 设计态模拟面板：配置样式作用在面板上（对应预览时作用在弹窗/抽屉组件）。
 * 尺寸 props（width / size）仅在样式未设置对应尺寸时作为兜底。
 */
const panelStyle = computed(() => {
  const style: Record<string, string | number> = {
    ...resolveOverlayHostStyle(rawStyles.value),
  }

  if (isModal.value) {
    const width = propsInfo.value.width
    const configuredStyleWidth = rawStyles.value?.width
    if (String(configuredStyleWidth) === 'auto') {
      // 设计态 auto：接近画布宽度并左右留白（见期望效果）
      style.width = 'calc(100% - 32px)'
    } else if (configuredStyleWidth == null || configuredStyleWidth === '') {
      style.width =
        width != null && width !== '' && String(width) !== 'auto'
          ? String(width)
          : '480px'
    }
    if (style.maxWidth == null && style['max-width'] == null) {
      style.maxWidth = 'calc(100% - 32px)'
    }
  }

  if (isDrawer.value) {
    const size = propsInfo.value.size
    const dir = direction.value
    const isVertical = dir === 'ttb' || dir === 'btt'
    if (isVertical) {
      if (style.width == null || style.width === '' || String(style.width) === 'fit-content') {
        style.width = '100%'
      }
      if (style.height == null || style.height === '') {
        style.height = size != null && size !== '' ? String(size) : '40%'
      }
      if (style.maxHeight == null && style['max-height'] == null) {
        style.maxHeight = 'calc(100% - 16px)'
      }
    } else {
      if (style.height == null || style.height === '') style.height = '100%'
      if (style.width == null || style.width === '') {
        style.width = size != null && size !== '' ? String(size) : '30%'
      } else if (String(style.width) === 'fit-content') {
        if (style.minWidth == null && style['min-width'] == null) {
          style.minWidth =
            size != null && size !== '' && size !== 'auto'
              ? String(size)
              : '30%'
        }
      }
      if (style.maxWidth == null && style['max-width'] == null) {
        style.maxWidth = 'calc(100% - 16px)'
      }
    }
  }

  return style
})

watch(
  structure,
  (node) => {
    if (props.uuid && !node) emit('close')
  },
)

const onClose = () => emit('close')

const onChildAdd = (event: any) => {
  if (!structure.value) return
  if (!Array.isArray(structure.value.children)) structure.value.children = []
  emit('add', { event, list: structure.value.children })
}

const onFooterChildAdd = (event: any) => {
  if (!structure.value) return
  if (!Array.isArray(structure.value.footerSlot)) structure.value.footerSlot = []
  emit('add', { event, list: structure.value.footerSlot })
}

const onNestedAdd = (payload: any) => emit('add', payload)
const onSpecial = (payload: any) => emit('special', payload)
const onDelete = (payload: any) => emit('delete', payload)
const onCopy = (payload: any) => emit('copy', payload)
const onActive = (payload: any) => emit('active', payload)
</script>

<style lang="scss" scoped>
/* 限制在中间画布区域内，不全屏 */
.overlay-editor {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.overlay-editor__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.overlay-editor__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--component-background-color, #fff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.overlay-editor__panel.is-modal {
  flex: 0 0 auto;
  align-self: center;
  border-radius: 8px;
  min-height: 200px;
  max-height: calc(100% - 32px);
}

.overlay-editor__panel.is-drawer {
  position: absolute;
}

.overlay-editor__panel.is-drawer-rtl {
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 0;
}

.overlay-editor__panel.is-drawer-ltr {
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 0;
}

.overlay-editor__panel.is-drawer-ttb {
  top: 0;
  left: 0;
  right: 0;
  border-radius: 0;
}

.overlay-editor__panel.is-drawer-btt {
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0;
}

.overlay-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--layout-border-color);
}

.overlay-editor__title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overlay-editor__close {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: var(--text-color-secondary, #909399);
  cursor: pointer;

  &:hover {
    background: var(--color-primary-a08, rgba(64, 158, 255, 0.08));
    color: var(--text-color, #303133);
  }
}

.overlay-editor__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
  overflow: auto;
}

.overlay-editor__footer {
  flex: 0 0 auto;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color, #f5f7fa);
}

.overlay-editor__drop.draggable-grop-wrap {
  width: 100%;
  min-height: 140px;
  height: auto;
  overflow: visible;
  box-sizing: border-box;

  &.is-footer {
    min-height: 56px;
  }
}
</style>
