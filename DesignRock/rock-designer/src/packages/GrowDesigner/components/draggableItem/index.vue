<template>
  <div
    class="draggable-item"
    :class="{
      'is-active': isActived,
      'is-idle': !isActived,
    }"
    @click.stop="onActiveStructure"
  >
    <div v-show="isActived" class="draggable-item__toolbar">
      <GrowIconify
        class="draggable-content-bar draggable-item__action is-handle"
        icon="carbon:move"
        :size="14"
        title="拖拽排序"
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
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import { inject, computed, toRefs } from 'vue'

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

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

const isAdd = computed(() => currentArgument?.value?.isAdd)

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
  border: 1px dashed transparent;
  border-radius: 6px;
  background: var(--component-background-color);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &.is-idle:hover {
    border-color: var(--color-primary-a28);
  }

  &.is-active {
    border-color: var(--primary-color);
    border-style: solid;
    box-shadow: 0 0 0 1px var(--color-primary-a16);
  }
}

.draggable-item__body {
  padding: 6px;
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
