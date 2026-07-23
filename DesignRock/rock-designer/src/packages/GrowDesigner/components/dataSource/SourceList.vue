<template>
  <GrowScrollbar class="min-h-0 flex-1">
    <div class="p-2">
      <div
        v-if="!list.length"
        class="px-2 py-6 text-center text-xs text-text-secondary"
      >
        {{ emptyText || '暂无数据，点击右上角添加' }}
      </div>
      <draggable
        v-else
        :model-value="list"
        item-key="id"
        tag="div"
        :animation="180"
        handle=".drag-handle"
        @update:model-value="emit('update:list', $event)"
      >
        <template #item="{ element }">
          <div
            class="group mb-1.5 flex items-center gap-1 rounded px-1 py-2 hover:bg-layout"
            :class="{ 'bg-primary-a08': activeId === element.id }"
          >
            <span
              class="drag-handle flex-center h-6 w-6 shrink-0 cursor-grab text-text-secondary active:cursor-grabbing"
              title="拖拽排序"
              @click.stop
            >
              <GrowIconify icon="carbon:draggable" :size="14" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-text">{{ element.name }}</p>
              <p class="mt-0.5 truncate text-xs text-text-secondary">
                {{ element.description || '暂无描述' }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <GrowButton
                text
                size="small"
                title="编辑"
                aria-label="编辑"
                @click.stop="emit('edit', element)"
              >
                <GrowIconify icon="carbon:edit" :size="14" />
              </GrowButton>
              <GrowButton
                text
                size="small"
                type="danger"
                title="删除"
                aria-label="删除"
                @click.stop="emit('remove', element.id)"
              >
                <GrowIconify icon="carbon:trash-can" :size="14" />
              </GrowButton>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </GrowScrollbar>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

defineOptions({ name: 'DataSourceList' })

type ListItem = {
  id: string
  name: string
  description?: string
}

defineProps<{
  list: ListItem[]
  activeId?: string
  emptyText?: string
}>()

const emit = defineEmits<{
  'update:list': [list: ListItem[]]
  edit: [item: ListItem]
  remove: [id: string]
}>()
</script>
