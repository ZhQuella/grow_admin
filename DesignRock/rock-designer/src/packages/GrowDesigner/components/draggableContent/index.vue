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
    :empty-insert-threshold="40"
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
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background-color: var(--component-background-color);
}
</style>
