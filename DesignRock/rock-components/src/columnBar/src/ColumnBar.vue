<template>
  <GrowPopover
    :visible="visible"
    :width="350"
    placement="top-end"
    trigger="click"
    persistent
    @update:visible="visible = $event"
    @hide="onSetColumns"
  >
    <template #reference>
      <GrowButton circle>
        <GrowIconify icon="ant-design:table-outlined" :size="18" />
      </GrowButton>
    </template>
    <div>
      <div class="flex justify-end border-b border-solid border-border px-[10px] py-[5px]">
        <GrowCheckbox
          :indeterminate="state.catchTreeCheckedKeys.length !== allChild.length"
          :model-value="isAllChecked"
          @update:model-value="onAllSelectChange"
        >
          {{ t('COLUMN_BAR.SELECT_ALL') }}
        </GrowCheckbox>
      </div>
      <GrowScrollbar height="400px">
        <GrowTree
          ref="treeRef"
          :node-key="nodeKey"
          :data="state.treeData"
          :props="{ label: renderLabel }"
          show-checkbox
          default-expand-all
          @check="onTreeChange"
        />
      </GrowScrollbar>
      <div class="flex justify-end gap-2 border-t border-solid border-border p-[10px]">
        <GrowButton @click="onResetColumns">
          <GrowIconify icon="ant-design:database-outlined" :size="16" />
          {{ t('SEARCH_BAR.RESET_SYETEM') }}
        </GrowButton>
        <GrowButton type="primary" @click="onSetColumns">
          <GrowIconify icon="ant-design:check-outlined" :size="16" />
          {{ t('PUBLIC.CONFIRM_TEXT') }}
        </GrowButton>
      </div>
    </div>
  </GrowPopover>
</template>

<script lang="ts" setup>
import { toRefs, ref } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { RockComponent } from '#/RockComponent'
import { useInitTree } from '../use/useInitTree'
import { useEvent } from '../use/useEvent'
import type { ColumnBarItem } from '../types'

defineOptions({
  name: RockComponent.ColumnBar,
  customOptions: {
    isPresetComponent: true,
  },
})

const props = withDefaults(
  defineProps<{
    columns?: ColumnBarItem[]
    nodeKey?: string
  }>(),
  {
    columns: () => [],
    nodeKey: 'field',
  },
)

const emit = defineEmits<{
  confirm: [columns: ColumnBarItem[]]
}>()

const { t } = useI18n()
const visible = ref(false)
const { columns, nodeKey } = toRefs(props)

const { renderLabel, treeRef, getTree, catchCheckedKeys, state, allChild, isAllChecked, getAllChild } =
  useInitTree({
    columns,
    nodeKey,
  })

const { onTreeChange, onAllSelectChange, onSetColumns, onResetColumns } = useEvent({
  getTree,
  state,
  catchCheckedKeys,
  allChild,
  getAllChild,
  emit,
  visible,
  nodeKey,
})
</script>
