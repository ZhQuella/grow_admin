<template>
  <div class="draggable-view">
    <div ref="stageRef" class="draggable-stage">
      <GrowScrollbar height="100%" class="draggable-stage__scroll">
        <draggableContent
          :draggableConfig="draggableConfig"
          @add="onDraggableAdd"
          @special="onSpecialAdd"
          @active="onActive"
          @delete="onDeleteItem"
          @copy="onCopyItem"
        />
      </GrowScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import draggableContent from '../draggableContent/index.vue'
import { useEvents } from './use/useEvents'

const emits = defineEmits(['add', 'special', 'active', 'delete', 'copy'])

defineOptions({ name: 'draggableView' })

interface Props {
  draggableConfig: any
}

defineProps<Props>()

const { onDraggableAdd, onSpecialAdd, onActive, onDeleteItem, onCopyItem } = useEvents({
  emits,
})

/** 舞台实际高度写入 CSS 变量，供子项 % 高度换算，且不影响内容区滚动 */
const stageRef = ref<HTMLElement | null>(null)
let stageObserver: ResizeObserver | null = null

const syncStageHeightVar = () => {
  const el = stageRef.value
  if (!el) return
  el.style.setProperty('--designer-stage-height', `${el.clientHeight}px`)
}

onMounted(() => {
  syncStageHeightVar()
  if (typeof ResizeObserver === 'undefined' || !stageRef.value) return
  stageObserver = new ResizeObserver(() => syncStageHeightVar())
  stageObserver.observe(stageRef.value)
})

onBeforeUnmount(() => {
  stageObserver?.disconnect()
  stageObserver = null
})
</script>

<style lang="scss" scoped>
.draggable-view {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 5px;
  overflow: hidden;
}

/* 外层锁死高度；滚动只发生在内部 GrowScrollbar */
.draggable-stage {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background-color: var(--component-background-color);
}

.draggable-stage__scroll {
  width: 100%;
  height: 100%;
}

/* wrap 锁住视口高度，view 可随内容增高 → 既能全区域投放，又能滚动 */
.draggable-stage__scroll :deep(.el-scrollbar__wrap),
.draggable-stage__scroll :deep(.n-scrollbar-container) {
  height: 100%;
  max-height: 100%;
}

.draggable-stage__scroll :deep(.el-scrollbar__view),
.draggable-stage__scroll :deep(.n-scrollbar-content) {
  box-sizing: border-box;
  min-height: 100%;
}

/* 白色展示区外壳：固定高度，滚动发生在内部 */
.draggable-stage {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background-color: var(--component-background-color);
}

.draggable-stage__scroll {
  flex: 1 1 auto;
  width: 100%;
  height: 0;
  min-height: 0;
}

.draggable-stage__scroll :deep(.n-scrollbar),
.draggable-stage__scroll :deep(.el-scrollbar) {
  height: 100%;
}

.draggable-stage__scroll :deep(.n-scrollbar-container),
.draggable-stage__scroll :deep(.el-scrollbar__wrap) {
  max-height: 100%;
}

.draggable-stage__scroll :deep(.n-scrollbar-content),
.draggable-stage__scroll :deep(.el-scrollbar__view) {
  min-height: 100%;
  box-sizing: border-box;
}
</style>

<style lang="scss">
.draggable-grop-wrap .ghost {
  box-sizing: border-box !important;
  width: 100% !important;
  display: block !important;
  height: 4px !important;
  min-width: 0 !important;
  min-height: 4px !important;
  max-width: none !important;
  margin: 6px 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: none !important;
  border-radius: 999px !important;
  background-color: rgb(var(--primary-color-rgb)) !important;
  box-shadow: 0 0 0 2px var(--color-primary-a16) !important;
  opacity: 1 !important;
  font-size: 0 !important;
  line-height: 0 !important;
  pointer-events: none !important;
}

/* 行内级：投放指示线保持短条，不要撑满整行 */
.draggable-grop-wrap .ghost.is-inline-block,
.draggable-grop-wrap .ghost.is-inline-level {
  display: inline-block !important;
  width: 96px !important;
  min-width: 96px !important;
  max-width: 96px !important;
  height: 4px !important;
  min-height: 4px !important;
  margin: 6px 6px 6px 0 !important;
  vertical-align: middle !important;
}

.draggable-grop-wrap .ghost > *,
.draggable-grop-wrap .ghost .draggable-item__toolbar,
.draggable-grop-wrap .ghost .draggable-item__body {
  display: none !important;
  visibility: hidden !important;
}

/* 拖拽中的镜像/选中项：隐藏工具栏，降低透明度 */
.draggable-grop-wrap .drag-item,
.draggable-grop-wrap .chosen-item {
  opacity: 0.72 !important;
}

.draggable-grop-wrap .drag-item .draggable-item__toolbar,
.draggable-grop-wrap .chosen-item .draggable-item__toolbar {
  display: none !important;
}
</style>
