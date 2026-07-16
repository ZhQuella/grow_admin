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
  width: 100% !important;
  display: block !important;
  height: 4px !important;
  margin: 6px 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: none !important;
  border-radius: 999px !important;
  background-color: rgb(var(--primary-color-rgb)) !important;
  box-shadow: 0 0 0 2px var(--color-primary-a16) !important;
  opacity: 1 !important;
}
</style>
