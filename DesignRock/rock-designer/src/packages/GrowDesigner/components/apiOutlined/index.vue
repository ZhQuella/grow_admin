<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col overflow-visible"
    @click.stop
    @mouseup.stop
  >
    <div
      class="flex h-10 shrink-0 items-center justify-end border-b border-solid border-border px-1"
    >
      <GrowButton type="primary" size="small" @click.stop="onCreate">
        <GrowIconify icon="carbon:add" :size="16" class="mr-1" />
        添加
      </GrowButton>
    </div>

    <ApiList
      v-model:list="sortableList"
      :active-id="drawerVisible ? editingId : ''"
      @edit="onEdit"
      @remove="onRemove"
    />

    <div
      v-if="drawerVisible"
      class="absolute bottom-0 left-full top-0 z-20 flex w-[520px] flex-col border-l border-solid border-border bg-component shadow-card"
    >
      <div
        class="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
      >
        <h4 class="m-0 text-sm font-medium text-text">
          {{ editingId ? '修改数据请求' : '添加数据请求' }}
        </h4>
        <div class="flex shrink-0 items-center gap-2">
          <GrowButton type="primary" size="small" @click.stop="onSave">保存</GrowButton>
          <GrowButton type="primary" plain size="small" @click.stop="onClose">取消</GrowButton>
        </div>
      </div>

      <GrowScrollbar class="min-h-0 flex-1">
        <ApiForm ref="formRef" :model="formData" :rules="formRules" />
      </GrowScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useApiOutlined } from './use/useApiOutlined'
import ApiList from './ApiList.vue'
import ApiForm from './ApiForm.vue'

defineOptions({ name: 'apiOutlined' })

export type {
  DesignerApiOutlinedItem,
  DesignerApiParam,
  DesignerApiProcessor,
  DesignerApiProcessorType,
} from './types'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = toRefs(props)

const {
  formRef,
  formData,
  formRules,
  drawerVisible,
  editingId,
  sortableList,
  onCreate,
  onEdit,
  onClose,
  onSave,
  onRemove,
} = useApiOutlined(data)
</script>
