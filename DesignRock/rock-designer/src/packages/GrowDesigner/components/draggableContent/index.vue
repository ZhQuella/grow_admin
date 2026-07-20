<template>
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
    :empty-insert-threshold="120"
    v-model="draggableConfig.structures"
    class="draggable-grop-wrap"
    handle=".draggable-content-bar"
    @add="onDraggableAdd"
  >
    <template #item="{ element }">
      <DraggableItem
        :structure="element"
        :config="draggableConfig.renderArgument[element.uuid]"
        @special="onSpecialAdd"
        @delete="onSpecialDelete"
        @copy="onCopyItem"
        @active="onActive"
      >
        <abstractionComponent
          :config="draggableConfig.renderArgument[element.uuid]"
          :propsInfo="draggableConfig.props[element.uuid]"
          :draggable-config="draggableConfig"
          :structure="element"
          @add="onChildAdd"
          @delete="onSpecialDelete"
          @copy="onCopyItem"
          @special="onSpecialAdd"
          @active="onActive"
        />
      </DraggableItem>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import DraggableItem from '../draggableItem/index.vue'
import abstractionComponent from '../abstractionComponent/index.vue'

const emit = defineEmits(['add', 'special', 'delete', 'active', 'copy'])

interface Props {
  draggableConfig: any
}
const props = defineProps<Props>()

const onDraggableAdd = (event: any) => {
  emit('add', { event, list: props.draggableConfig.structures })
}

const onChildAdd = (event: any) => {
  emit('add', event)
}

const onSpecialAdd = (event: any) => {
  emit('special', event)
}

const onActive = (event: any) => {
  emit('active', event)
}

const onSpecialDelete = (event: any) => {
  emit('delete', event)
}

const onCopyItem = (event: any) => {
  emit('copy', event)
}
</script>

<style lang="scss" scoped>
.draggable-grop-wrap {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  /*
   * 用舞台实测高度撑满可投放区域（兼容空画布拖入），
   * 内容超出后仍可继续增高并由外层滚动，不锁死 height。
   */
  min-height: var(--designer-stage-height, 100%);
  padding: 8px;
}
</style>
