<template>
  <GrowDialog
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    append-to-body
    destroy-on-close
  >
    <component
      :is="eventComponent"
      v-if="visible && person && eventComponent"
      ref="panelRef"
      :person="person"
      :detail="detail"
      :dept-tree="deptTree"
      :mode="panelMode"
    />
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="submitting" @click="submit">确定</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, type Component } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { getSystemPersonDetail } from '../../../api/systemPerson'
import type { PersonEventMode, SystemPersonDetail, SystemPersonListItem } from '../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import { toMessage } from '../use/helpers'

defineOptions({ name: 'PersonEventDialog' })

const emit = defineEmits<{
  success: []
}>()

const ConfirmEventForm = defineAsyncComponent(() => import('./events/ConfirmEventForm.vue'))
const ResignEventForm = defineAsyncComponent(() => import('./events/ResignEventForm.vue'))
const StatusDateEventForm = defineAsyncComponent(() => import('./events/StatusDateEventForm.vue'))
const ReturnEventForm = defineAsyncComponent(() => import('./events/ReturnEventForm.vue'))
const DeleteEventForm = defineAsyncComponent(() => import('./events/DeleteEventForm.vue'))

const EVENT_COMPONENTS: Record<Exclude<PersonEventMode, 'transfer'>, Component> = {
  confirm: ConfirmEventForm,
  resign: ResignEventForm,
  disable: StatusDateEventForm,
  enable: StatusDateEventForm,
  retire: StatusDateEventForm,
  reinstate: ReturnEventForm,
  rehire: ReturnEventForm,
  delete: DeleteEventForm,
}

const EVENT_TITLES: Record<Exclude<PersonEventMode, 'transfer'>, string> = {
  confirm: '转正',
  resign: '离职',
  disable: '停用',
  enable: '启用',
  retire: '退休',
  reinstate: '复职',
  rehire: '返聘',
  delete: '删除',
}

const message = useMsg()
const visible = ref(false)
const submitting = ref(false)
const mode = ref<Exclude<PersonEventMode, 'transfer'>>('confirm')
const person = ref<SystemPersonListItem | null>(null)
const detail = ref<SystemPersonDetail | null>(null)
const deptTree = ref<SystemDeptTreeNode[]>([])
const panelRef = ref<{ submit: () => Promise<void> } | null>(null)

const eventComponent = computed(() => EVENT_COMPONENTS[mode.value])
const panelMode = computed(() => {
  if (mode.value === 'disable' || mode.value === 'enable' || mode.value === 'retire') return mode.value
  if (mode.value === 'reinstate' || mode.value === 'rehire') return mode.value
  return undefined
})
const dialogWidth = computed(() => (mode.value === 'resign' ? '640px' : '520px'))
const title = computed(() => {
  const name = person.value?.name || ''
  const label = EVENT_TITLES[mode.value]
  return name ? `${label} · ${name}` : label
})

async function open(nextMode: Exclude<PersonEventMode, 'transfer'>, row: SystemPersonListItem, tree: SystemDeptTreeNode[]) {
  mode.value = nextMode
  person.value = row
  deptTree.value = tree
  detail.value = null
  visible.value = true
  try {
    detail.value = await getSystemPersonDetail(row.userId)
  } catch (error) {
    message.error(toMessage(error, '加载人员详情失败'))
  }
}

async function submit() {
  submitting.value = true
  try {
    await panelRef.value?.submit()
    message.success('操作成功')
    visible.value = false
    emit('success')
  } catch (error) {
    if (error instanceof Error && (error.message === '校验未通过' || error.message === '表单未就绪')) return
    message.error(toMessage(error, '操作失败'))
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>
