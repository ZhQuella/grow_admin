<template>
  <GrowDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    append-to-body
    destroy-on-close
  >
    <component
      :is="activeComponent"
      v-if="activeComponent && activeState"
      :state="activeState"
    />
    <template #footer>
      <GrowSpace>
        <GrowButton @click="cancelCurrent">{{ cancelText }}</GrowButton>
        <GrowButton :type="confirmType" :loading="submitting" @click="submitCurrent">
          {{ confirmText }}
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, markRaw, type Component } from 'vue'
import type { useMenuActions } from '../use/useMenuActions'
import type { useMenuForm } from '../use/useMenuForm'
import MenuDeletePanel from './MenuDeletePanel.vue'
import MenuFormPanel from './MenuFormPanel.vue'
import ColumnFormPanel from './MenuColumnConfig/ColumnFormPanel.vue'
import ColumnListPanel from './MenuColumnConfig/ColumnListPanel.vue'
import TableFormPanel from './MenuColumnConfig/TableFormPanel.vue'
import type { useMenuColumns } from './MenuColumnConfig/useMenuColumns'
import FunctionFormPanel from './MenuFunctionConfig/FunctionFormPanel.vue'
import FunctionListPanel from './MenuFunctionConfig/FunctionListPanel.vue'
import type { useMenuFunctions } from './MenuFunctionConfig/useMenuFunctions'

defineOptions({ name: 'MenuManageDialog' })

type DialogMode =
  | 'menu-form'
  | 'menu-delete'
  | 'function-list'
  | 'function-form'
  | 'column-list'
  | 'table-form'
  | 'column-form'

const props = defineProps<{
  menuForm: ReturnType<typeof useMenuForm>
  menuActions: ReturnType<typeof useMenuActions>
  functionConfig: ReturnType<typeof useMenuFunctions>
  columnConfig: ReturnType<typeof useMenuColumns>
}>()

const COMPONENTS: Record<DialogMode, Component> = {
  'menu-form': markRaw(MenuFormPanel),
  'menu-delete': markRaw(MenuDeletePanel),
  'function-list': markRaw(FunctionListPanel),
  'function-form': markRaw(FunctionFormPanel),
  'column-list': markRaw(ColumnListPanel),
  'table-form': markRaw(TableFormPanel),
  'column-form': markRaw(ColumnFormPanel),
}

const activeMode = computed<DialogMode | null>(() => {
  if (props.menuForm.formVisible.value) return 'menu-form'
  if (props.menuActions.deleteVisible.value) return 'menu-delete'
  if (props.functionConfig.formVisible.value) return 'function-form'
  if (props.functionConfig.listVisible.value) return 'function-list'
  if (props.columnConfig.tableFormVisible.value) return 'table-form'
  if (props.columnConfig.formVisible.value) return 'column-form'
  if (props.columnConfig.listVisible.value) return 'column-list'
  return null
})

const activeComponent = computed(() => activeMode.value ? COMPONENTS[activeMode.value] : null)
const activeState = computed(() => {
  if (activeMode.value === 'menu-form') return props.menuForm
  if (activeMode.value === 'menu-delete') return props.menuActions
  if (activeMode.value === 'function-list' || activeMode.value === 'function-form') {
    return props.functionConfig
  }
  if (activeMode.value === 'column-list' || activeMode.value === 'table-form' || activeMode.value === 'column-form') {
    return props.columnConfig
  }
  return null
})

const dialogVisible = computed({
  get: () => Boolean(activeMode.value),
  set: (visible: boolean) => {
    if (!visible) cancelCurrent()
  },
})

const dialogTitle = computed(() => {
  if (activeMode.value === 'menu-form') return props.menuForm.formMode.value === 'create' ? '新增' : '编辑'
  if (activeMode.value === 'menu-delete') return '删除确认'
  if (activeMode.value === 'function-list') {
    const title = props.functionConfig.menu.value?.title
    return title ? `功能配置 · ${title}` : '功能配置'
  }
  if (activeMode.value === 'function-form') {
    return props.functionConfig.formMode.value === 'create' ? '新增功能' : '编辑功能'
  }
  if (activeMode.value === 'column-list') {
    const title = props.columnConfig.menu.value?.title
    return title ? `表定义 · ${title}` : '表定义'
  }
  if (activeMode.value === 'table-form') {
    return props.columnConfig.tableFormMode.value === 'create' ? '新增表' : '编辑表'
  }
  if (activeMode.value === 'column-form') {
    const prefix = props.columnConfig.formMode.value === 'create' ? '新增列' : '编辑列'
    return `${prefix} · ${props.columnConfig.currentTableTitle.value}`
  }
  return ''
})

const dialogWidth = computed(() => {
  if (activeMode.value === 'menu-form') return '680px'
  if (activeMode.value === 'menu-delete') return '420px'
  if (activeMode.value === 'column-list') return '640px'
  if (activeMode.value === 'function-list') return '520px'
  return '480px'
})

const cancelText = computed(() => (
  activeMode.value === 'function-form'
  || activeMode.value === 'table-form'
  || activeMode.value === 'column-form'
    ? '返回'
    : '取消'
))
const confirmText = computed(() => (activeMode.value === 'menu-delete' ? '删除' : '确定'))
const confirmType = computed(() => (activeMode.value === 'menu-delete' ? 'danger' : 'primary'))
const submitting = computed(() => {
  if (activeMode.value === 'menu-form') return props.menuForm.formSubmitting.value
  if (activeMode.value === 'menu-delete') return props.menuActions.deleteSubmitting.value
  if (activeMode.value === 'function-list') return props.functionConfig.listSaving.value
  if (activeMode.value === 'column-list') return props.columnConfig.listSaving.value
  return false
})

function cancelCurrent() {
  if (activeMode.value === 'menu-form') props.menuForm.formVisible.value = false
  else if (activeMode.value === 'menu-delete') props.menuActions.deleteVisible.value = false
  else if (activeMode.value === 'function-form') props.functionConfig.formVisible.value = false
  else if (activeMode.value === 'function-list') props.functionConfig.closeList()
  else if (activeMode.value === 'table-form') props.columnConfig.tableFormVisible.value = false
  else if (activeMode.value === 'column-form') props.columnConfig.formVisible.value = false
  else if (activeMode.value === 'column-list') props.columnConfig.closeList()
}

function submitCurrent() {
  if (activeMode.value === 'menu-form') void props.menuForm.submitForm()
  else if (activeMode.value === 'menu-delete') void props.menuActions.confirmDelete()
  else if (activeMode.value === 'function-form') void props.functionConfig.submitForm()
  else if (activeMode.value === 'function-list') void props.functionConfig.saveList()
  else if (activeMode.value === 'table-form') void props.columnConfig.submitTableForm()
  else if (activeMode.value === 'column-form') void props.columnConfig.submitForm()
  else if (activeMode.value === 'column-list') void props.columnConfig.saveList()
}
</script>
