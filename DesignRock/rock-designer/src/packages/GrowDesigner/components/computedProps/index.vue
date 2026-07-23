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

    <SourceList
      v-model:list="sortableList"
      :active-id="drawerVisible ? editingId : ''"
      empty-text="暂无计算属性，点击右上角添加"
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
          {{ editingId ? '修改计算属性' : '添加计算属性' }}
        </h4>
        <div class="flex shrink-0 items-center gap-2">
          <GrowButton type="primary" size="small" @click.stop="onSave">保存</GrowButton>
          <GrowButton type="primary" plain size="small" @click.stop="onClose">取消</GrowButton>
        </div>
      </div>

      <ComputedForm ref="formRef" :model="formData" :rules="formRules" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useComputedProps } from '../dataSource/use/useComputedProps'
import SourceList from '../dataSource/SourceList.vue'
import ComputedForm from '../dataSource/ComputedForm.vue'

defineOptions({ name: 'computedProps' })

export type { DesignerComputedPropItem } from '../dataSource/types'

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
} = useComputedProps(data)
</script>
