<template>
  <div
    class="grow-designer"
    @mouseup="onLeftOptionClose"
    @click="onActivated('')"
  >
    <div class="grow-designer__toolbar">
      <div class="grow-designer__toolbar-left">
        <GrowButton
          size="small"
          :disabled="!draggableConfig.structures.length"
          @click.stop="onClearCanvas"
        >
          <GrowIconify icon="carbon:erase" :size="14" class="grow-designer__toolbar-icon" />
          清空
        </GrowButton>
        <span class="grow-designer__toolbar-desc">从左侧拖入组件到画布</span>
      </div>
      <GrowButton size="small" type="primary" @click.stop="onPreview">
        <GrowIconify icon="carbon:play" :size="14" class="grow-designer__toolbar-icon" />
        预览
      </GrowButton>
    </div>

    <GrowDrawer
      v-model="previewVisible"
      title="页面预览"
      direction="btt"
      placement="bottom"
      size="90%"
      height="90%"
      :destroy-on-close="true"
      class="grow-designer__preview-drawer"
      @click.stop
    >
      <GrowRenderer :schema="previewSchema">
        <template #empty>空预览</template>
      </GrowRenderer>
    </GrowDrawer>

    <div class="grow-designer__body">
      <aside class="grow-designer__rail" @mouseup.stop>
        <div
          v-for="item in railItems"
          :key="item.type"
          class="grow-designer__rail-item"
          :class="{ 'is-active': optionConfig.visible && optionConfig.type === item.type }"
          :data-tip="item.label"
          role="button"
          tabindex="0"
          :aria-label="item.label"
          @click="onLeftOptionClick(item.type)"
          @keydown.enter.prevent="onLeftOptionClick(item.type)"
          @keydown.space.prevent="onLeftOptionClick(item.type)"
        >
          <GrowIconify :icon="item.icon" :size="18" class="grow-designer__rail-icon" />
        </div>
      </aside>

      <div
        v-if="optionConfig.visible"
        class="grow-designer__side"
        :class="{ 'is-overlay': !optionConfig.isFixed }"
        @mouseup.stop
        @click.stop
      >
        <div class="grow-designer__side-header">
          <h4 class="grow-designer__side-title">{{ optionConfig.title }}</h4>
          <div class="grow-designer__side-actions">
            <button
              type="button"
              class="grow-designer__icon-btn"
              :class="{ 'is-active': optionConfig.isFixed }"
              :title="optionConfig.isFixed ? '取消固定' : '固定面板'"
              @click="onChangeOptionFixed"
            >
              <GrowIconify
                :icon="optionConfig.isFixed ? 'carbon:pin-filled' : 'carbon:pin'"
                :size="15"
              />
            </button>
            <button type="button" class="grow-designer__icon-btn" title="关闭" @click="onLeftClose">
              <GrowIconify icon="carbon:close" :size="15" />
            </button>
          </div>
        </div>
        <div class="grow-designer__side-body">
          <component
            :is="optionConfig.componentName"
            :data="draggableConfig"
            class="grow-designer__side-content"
            @dragstart="onGenerateKey"
            @node-click="onActiveNode"
          />
        </div>
      </div>

      <div class="grow-designer__canvas">
        <DraggableView
          class="draggable-content"
          :draggableConfig="draggableConfig"
          @add="onDraggableViewAdd"
          @special="onSpecialAdd"
          @active="onActivated"
          @delete="onDeleteItem"
          @copy="onCopyItem"
        />
        <div v-if="!draggableConfig.structures.length" class="grow-designer__empty">
          <div class="grow-designer__empty-inner">
            <GrowIconify icon="carbon:application" :size="56" class="grow-designer__empty-icon" />
            <p class="grow-designer__empty-title">请从左侧组件库中拖入组件</p>
          </div>
        </div>
        <OverlayEditor
          v-if="overlayEditUUID"
          :uuid="overlayEditUUID"
          :draggable-config="draggableConfig"
          @close="overlayEditUUID = ''"
          @add="onDraggableViewAdd"
          @special="onSpecialAdd"
          @active="onActivated"
          @delete="onDeleteItem"
          @copy="onCopyItem"
        />
      </div>

      <div class="grow-designer__inspector" @click.stop>
        <component
          :is="activeUUID ? 'EleOptions' : 'PageOptions'"
          :config="draggableConfig"
          :activeUUID="activeUUID"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DraggableView from './components/draggableView/index.vue'
import OverlayEditor from './components/overlayEditor/index.vue'
import { GrowRenderer } from '../GrowRenderer'
import type { DesignerSchema } from '../GrowRenderer/types'
import { useOption } from './use/useOption'
import { useEvents } from './use/useEvents'

const railItems = [
  { type: 'module', label: '组件库', icon: 'carbon:application' },
  { type: 'json', label: '查看数据', icon: 'carbon:data-base' },
  { type: 'tree', label: '结构树', icon: 'carbon:tree-view' },
  { type: 'dataBin', label: '数据源', icon: 'carbon:data-bin' },
  { type: 'computedProps', label: '属性计算', icon: 'carbon:function' },
  { type: 'pageWatchers', label: '监听', icon: 'carbon:view' },
  { type: 'apiOutlined', label: '数据请求', icon: 'carbon:api' },
] as const

const {
  draggableConfig,
  optionConfig,
  onLeftOptionClick,
  onLeftOptionClose,
  onChangeOptionFixed,
  onLeftClose,
  activeUUID,
  overlayEditUUID,
} = useOption()

const {
  onGenerateKey,
  onDraggableViewAdd,
  onSpecialAdd,
  onActivated,
  onDeleteItem,
  onCopyItem,
  onActiveNode,
  onClearCanvas,
} = useEvents({
  draggableConfig,
  activeUUID,
  overlayEditUUID,
})

const previewVisible = ref(false)

/** 预览传结构 / 样式 / 属性 / 数据源 / 事件 */
const previewSchema = computed<DesignerSchema>(() => {
  // 显式读取每项字段，保证数据源内容变更时预览跟随更新
  const dataSource = (draggableConfig.dataSource || []).map((item: any) => ({
    id: item?.id,
    name: item?.name,
    description: item?.description,
    data: item?.data,
  }))
  const computedProps = (draggableConfig.computedProps || []).map((item: any) => ({
    id: item?.id,
    name: item?.name,
    description: item?.description,
    code: item?.code,
  }))
  return {
    structures: draggableConfig.structures,
    renderArgument: draggableConfig.renderArgument,
    props: draggableConfig.props,
    styles: draggableConfig.styles,
    pageConfig: draggableConfig.pageConfig,
    dataSource,
    computedProps,
    propBindModes: draggableConfig.propBindModes,
    events: draggableConfig.events,
  }
})

const onPreview = () => {
  previewVisible.value = true
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import moduleOptions from './components/moduleOptions/index.vue'
import reviewData from './components/reviewData/index.vue'
import reviewTree from './components/reviewTree/index.vue'
import EleOptions from './components/eleOptions/index.vue'
import PageOptions from './components/pageOptions/index.vue'
import dataSource from './components/dataSource/index.vue'
import computedProps from './components/computedProps/index.vue'
import pageWatchers from './components/pageWatchers/index.vue'
import apiOutlined from './components/apiOutlined/index.vue'

export default defineComponent({
  name: 'GrowDesigner',
  components: {
    EleOptions,
    PageOptions,
    moduleOptions,
    reviewData,
    reviewTree,
    dataSource,
    computedProps,
    pageWatchers,
    apiOutlined,
  },
})
</script>

<style lang="scss" scoped>
.grow-designer {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: auto;
  height: auto;
  min-height: 0;
  overflow: hidden;
  background: var(--layout-container-background-color);
}

.grow-designer__toolbar {
  box-sizing: border-box;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
}

.grow-designer__toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.grow-designer__toolbar-desc {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grow-designer__toolbar-icon {
  margin-right: 4px;
}

.grow-designer__body {
  position: relative;
  box-sizing: border-box;
  /* height:0 + flex:1 强制占满剩余高度，避免被内容撑开后回缩到底部 */
  flex: 1 1 auto;
  height: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
}

.grow-designer__rail {
  box-sizing: border-box;
  flex: 0 0 50px;
  width: 50px;
  min-width: 50px;
  height: 100%;
  padding: 5px;
  border-right: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
  overflow: visible;
  z-index: 20;
}

.grow-designer__rail-item {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto 5px;
  border-radius: 4px;
  color: var(--text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover,
  &.is-active {
    color: var(--primary-color);
  }

  /* 悬停 tips：不改动 DOM 结构，避免挤乱图标布局 */
  &::after {
    content: attr(data-tip);
    position: absolute;
    top: 50%;
    left: calc(100% + 10px);
    z-index: 40;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(48, 49, 51, 0.92);
    color: #fff;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-50%);
    transition: opacity 0.12s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
  }
}

.grow-designer__rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.grow-designer__rail-item :deep(.grow-iconify) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  line-height: 1;
  color: inherit;
}

.grow-designer__rail-item :deep(.grow-iconify svg) {
  display: block;
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.grow-designer__side {
  box-sizing: border-box;
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  min-height: 0;
  overflow: visible;
  border-right: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
  z-index: 15;

  &.is-overlay {
    position: absolute;
    left: 50px;
    top: 0;
    bottom: 0;
    box-shadow: var(--card-shadow);
  }
}

.grow-designer__side-header {
  box-sizing: border-box;
  flex: 0 0 40px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 5px;
  border-bottom: 1px solid var(--layout-border-color);
}

.grow-designer__side-title {
  box-sizing: border-box;
  margin: 0;
  flex: 1 1 auto;
  width: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  line-height: 30px;
  text-align: left;
  color: var(--text-color);
}

.grow-designer__side-actions {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  width: auto;
  margin: 0;
  margin-left: auto;
  padding: 0;
  gap: 0;
}

.grow-designer__icon-btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  width: 30px;
  min-width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: var(--primary-color);
  }

  &.is-active {
    color: var(--primary-color);
  }
}

.grow-designer__side-body {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.grow-designer__side-content {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: visible;
}

.grow-designer__canvas {
  position: relative;
  box-sizing: border-box;
  flex: 1 1 auto;
  width: 0;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  z-index: 1;
  background: var(--layout-container-background-color);
}

.grow-designer__empty {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.grow-designer__empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-color-secondary);
}

.grow-designer__empty-icon {
  display: inline-flex !important;
  width: 56px;
  height: 56px;
  line-height: 1;
  color: inherit;
}

.grow-designer__empty-icon :deep(svg) {
  display: block;
  width: 56px;
  height: 56px;
}

.grow-designer__empty-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  color: inherit;
}

.grow-designer__inspector {
  box-sizing: border-box;
  flex: 0 0 320px;
  width: 320px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
}

:deep(.grow-designer__side-scroll),
:deep(.grow-designer__side-content .module-options__scroll),
:deep(.grow-designer__side-content .designer-subpanel__body) {
  height: 100%;
}

:deep(.grow-designer__side-content .el-scrollbar),
:deep(.grow-designer__side-content .n-scrollbar),
:deep(.grow-designer__side-content .grow-scrollbar) {
  height: 100%;
}

:deep(.grow-designer__side-content .el-scrollbar__wrap),
:deep(.grow-designer__side-content .n-scrollbar-container) {
  max-height: 100%;
}

:deep(.grow-designer__preview-drawer.el-drawer),
:deep(.grow-designer__preview-drawer.n-drawer) {
  display: flex;
  flex-direction: column;
}

:deep(.grow-designer__preview-drawer .el-drawer__body),
:deep(.grow-designer__preview-drawer .n-drawer-body-content-wrapper) {
  flex: 1 1 auto;
  padding: 0;
  height: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--layout-container-background-color);
}

:deep(.grow-designer__preview-drawer .grow-renderer) {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
}

:deep(.draggable-content) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
