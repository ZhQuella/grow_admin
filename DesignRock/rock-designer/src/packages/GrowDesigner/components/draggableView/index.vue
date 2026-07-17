<template>
  <div class="draggable-view">
    <draggableContent
      :draggableConfig="draggableConfig"
      @add="onDraggableAdd"
      @special="onSpecialAdd"
      @active="onActive"
      @delete="onDeleteItem"
      @copy="onCopyItem"
    />
  </div>
</template>

<script setup lang="ts">
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
</script>

<style lang="scss" scoped>
.draggable-view {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 5px;
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
