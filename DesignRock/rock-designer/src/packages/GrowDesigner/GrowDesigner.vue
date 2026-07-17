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
      <GrowButton size="small" type="primary">
        <GrowIconify icon="carbon:play" :size="14" class="grow-designer__toolbar-icon" />
        预览
      </GrowButton>
    </div>

    <div class="grow-designer__body">
      <aside class="grow-designer__rail" @mouseup.stop>
        <div
          v-for="item in railItems"
          :key="item.type"
          class="grow-designer__rail-item"
          :class="{ 'is-active': optionConfig.visible && optionConfig.type === item.type }"
          :title="item.label"
          role="button"
          tabindex="0"
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
        <GrowScrollbar class="grow-designer__canvas-scroll draggable-content">
          <DraggableView
            :draggableConfig="draggableConfig"
            @add="onDraggableViewAdd"
            @special="onSpecialAdd"
            @active="onActivated"
            @delete="onDeleteItem"
            @copy="onCopyItem"
          />
        </GrowScrollbar>
        <div v-if="!draggableConfig.structures.length" class="grow-designer__empty">
          <div class="grow-designer__empty-inner">
            <GrowIconify icon="carbon:application" :size="56" class="grow-designer__empty-icon" />
            <p class="grow-designer__empty-title">请从左侧组件库中拖入组件</p>
          </div>
        </div>
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
import DraggableView from './components/draggableView/index.vue'
import { useOption } from './use/useOption'
import { useEvents } from './use/useEvents'

const railItems = [
  { type: 'module', label: '组件库', icon: 'carbon:application' },
  { type: 'json', label: '查看数据', icon: 'carbon:data-base' },
  { type: 'tree', label: '结构树', icon: 'carbon:tree-view' },
  { type: 'dataBin', label: '数据源', icon: 'carbon:data-bin' },
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
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import moduleOptions from './components/moduleOptions/index.vue'
import reviewData from './components/reviewData/index.vue'
import reviewTree from './components/reviewTree/index.vue'
import EleOptions from './components/eleOptions/index.vue'
import PageOptions from './components/pageOptions/index.vue'
import dataSource from './components/dataSource/index.vue'
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
  overflow-x: hidden;
  overflow-y: auto;
}

.grow-designer__rail-item {
  box-sizing: border-box;
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
  z-index: 1;
  background: var(--layout-container-background-color);
}

.grow-designer__canvas-scroll {
  width: 100%;
  height: 100%;
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

:deep(.draggable-content .el-scrollbar__wrap),
:deep(.draggable-content .n-scrollbar-container) {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

:deep(.draggable-content .el-scrollbar__view),
:deep(.draggable-content .n-scrollbar-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
</style>
