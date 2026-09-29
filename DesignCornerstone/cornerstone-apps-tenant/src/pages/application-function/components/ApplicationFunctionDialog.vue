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
import type { useApplicationFunctionActions } from '../use/useApplicationFunctionActions'
import type { useApplicationFunctionForm } from '../use/useApplicationFunctionForm'
import ApplicationFunctionDeletePanel from './ApplicationFunctionDeletePanel.vue'
import ApplicationFunctionFormPanel from './ApplicationFunctionFormPanel.vue'
import ColumnListPanel from './ColumnConfig/ColumnListPanel.vue'
import type { useApplicationColumns } from './ColumnConfig/useApplicationColumns'
import FunctionListPanel from './FunctionConfig/FunctionListPanel.vue'
import type { useApplicationFunctions } from './FunctionConfig/useApplicationFunctions'

defineOptions({ name: 'ApplicationFunctionDialog' })

type DialogMode =
  | 'function-form'
  | 'function-delete'
  | 'function-list'
  | 'column-list'

const props = defineProps<{
  functionForm: ReturnType<typeof useApplicationFunctionForm>
  functionActions: ReturnType<typeof useApplicationFunctionActions>
  functionConfig: ReturnType<typeof useApplicationFunctions>
  columnConfig: ReturnType<typeof useApplicationColumns>
}>()

const COMPONENTS: Record<DialogMode, Component> = {
  'function-form': markRaw(ApplicationFunctionFormPanel),
  'function-delete': markRaw(ApplicationFunctionDeletePanel),
  'function-list': markRaw(FunctionListPanel),
  'column-list': markRaw(ColumnListPanel),
}

const activeMode = computed<DialogMode | null>(() => {
  if (props.functionForm.formVisible.value) return 'function-form'
  if (props.functionActions.deleteVisible.value) return 'function-delete'
  if (props.functionConfig.listVisible.value) return 'function-list'
  if (props.columnConfig.listVisible.value) return 'column-list'
  return null
})

const activeComponent = computed(() => activeMode.value ? COMPONENTS[activeMode.value] : null)
const activeState = computed(() => {
  if (activeMode.value === 'function-form') return props.functionForm
  if (activeMode.value === 'function-delete') return props.functionActions
  if (activeMode.value === 'function-list') return props.functionConfig
  if (activeMode.value === 'column-list') return props.columnConfig
  return null
})

const dialogVisible = computed({
  get: () => Boolean(activeMode.value),
  set: (visible: boolean) => {
    if (!visible) cancelCurrent()
  },
})

const dialogTitle = computed(() => {
  if (activeMode.value === 'function-form') return props.functionForm.formMode.value === 'create' ? '新增' : '编辑'
  if (activeMode.value === 'function-delete') return '删除确认'
  if (activeMode.value === 'function-list') {
    const title = props.functionConfig.menu.value?.title
    return title ? `功能配置 · ${title}` : '功能配置'
  }
  if (activeMode.value === 'column-list') {
    const title = props.columnConfig.menu.value?.title
    return title ? `表定义 · ${title}` : '表定义'
  }
  return ''
})

const dialogWidth = computed(() => {
  if (activeMode.value === 'function-form') return '680px'
  if (activeMode.value === 'function-delete') return '420px'
  if (activeMode.value === 'column-list') return '960px'
  if (activeMode.value === 'function-list') return '760px'
  return '480px'
})

const cancelText = computed(() => '取消')
const confirmText = computed(() => (activeMode.value === 'function-delete' ? '删除' : '确定'))
const confirmType = computed(() => (activeMode.value === 'function-delete' ? 'danger' : 'primary'))
const submitting = computed(() => {
  if (activeMode.value === 'function-form') return props.functionForm.formSubmitting.value
  if (activeMode.value === 'function-delete') return props.functionActions.deleteSubmitting.value
  if (activeMode.value === 'function-list') return props.functionConfig.listSaving.value
  if (activeMode.value === 'column-list') return props.columnConfig.listSaving.value
  return false
})

function cancelCurrent() {
  if (activeMode.value === 'function-form') props.functionForm.formVisible.value = false
  else if (activeMode.value === 'function-delete') props.functionActions.deleteVisible.value = false
  else if (activeMode.value === 'function-list') props.functionConfig.closeList()
  else if (activeMode.value === 'column-list') props.columnConfig.closeList()
}

function submitCurrent() {
  if (activeMode.value === 'function-form') void props.functionForm.submitForm()
  else if (activeMode.value === 'function-delete') void props.functionActions.confirmDelete()
  else if (activeMode.value === 'function-list') void props.functionConfig.saveList()
  else if (activeMode.value === 'column-list') void props.columnConfig.saveList()
}
</script>
