<template>
  <GrowDrawer
    v-model="visible"
    :title="title"
    class="transfer-drawer"
    size="800px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="transfer-drawer__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" class="transfer-drawer__scroll" :height="`${height}px`">
          <div class="transfer-drawer__body">
            <p v-if="loading" class="transfer-drawer__hint">加载中…</p>
            <TransferEventForm
              v-else-if="visible && person"
              ref="panelRef"
              :person="person"
              :detail="detail"
              :dept-tree="deptTree"
              :intent="intent"
              @change="onTypeChange"
            />
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="submitting" @click="submit">{{ confirmText }}</GrowButton>
      </GrowSpace>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { getSystemPersonDetail } from '../../../api/systemPerson'
import {
  TRANSFER_ACTION_LABELS,
  type SystemPersonDetail,
  type SystemPersonListItem,
  type TransferIntent,
  type TransferType,
} from '../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import { toMessage } from '../use/helpers'
import TransferEventForm from './events/TransferEventForm.vue'

defineOptions({ name: 'PersonTransferDrawer' })

const emit = defineEmits<{
  success: []
}>()

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const submitting = ref(false)
const person = ref<SystemPersonListItem | null>(null)
const detail = ref<SystemPersonDetail | null>(null)
const deptTree = ref<SystemDeptTreeNode[]>([])
const intent = ref<TransferIntent>({})
const currentType = ref<TransferType>('primary')
const panelRef = ref<{ submit: () => Promise<void> } | null>(null)

const actionLabel = computed(() => TRANSFER_ACTION_LABELS[currentType.value])
const title = computed(() => {
  const name = person.value?.name || ''
  return name ? `${actionLabel.value} · ${name}` : actionLabel.value
})
const confirmText = computed(() => (currentType.value === 'part_time_end' ? '停止兼职' : '确定'))

function onTypeChange(type: TransferType) {
  currentType.value = type
}

async function open(row: SystemPersonListItem, tree: SystemDeptTreeNode[], next?: TransferIntent) {
  person.value = row
  deptTree.value = tree
  intent.value = next || {}
  currentType.value = next?.transferType || 'primary'
  detail.value = null
  visible.value = true
  loading.value = true
  try {
    detail.value = await getSystemPersonDetail(row.userId)
  } catch (error) {
    message.error(toMessage(error, '加载人员详情失败'))
  } finally {
    loading.value = false
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

<style scoped>
.transfer-drawer__watch {
  height: 100%;
  min-height: 0;
}

.transfer-drawer__body {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  padding: 16px 20px 8px;
  overflow-x: hidden;
}

.transfer-drawer__hint {
  padding: 48px 0;
  color: var(--text-color-secondary);
  text-align: center;
}
</style>

<style>
.transfer-drawer.el-drawer,
.transfer-drawer.n-drawer {
  display: flex;
  flex-direction: column;
}

.transfer-drawer .n-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.transfer-drawer .el-drawer__body,
.transfer-drawer .n-drawer-body,
.transfer-drawer .n-drawer-body-content-wrapper {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.transfer-drawer .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
