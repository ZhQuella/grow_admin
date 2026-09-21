<template>
  <div class="tenant-manage">
    <TenantListPanel
      ref="listPanelRef"
      @create="formDialogRef?.openCreate()"
      @action="handleAction"
    />
    <TenantFormDialog ref="formDialogRef" @success="reloadList" />
    <TenantActionDialogs ref="actionDialogsRef" @success="reloadList" />
    <TenantHistoryDrawer ref="historyDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SystemTenantListItem, TenantActionKey } from '../../types/systemTenant'
import TenantActionDialogs from './components/TenantActionDialogs.vue'
import TenantFormDialog from './components/TenantFormDialog.vue'
import TenantListPanel from './components/TenantListPanel.vue'
import TenantHistoryDrawer from './components/TenantHistoryDrawer.vue'

defineOptions({ name: 'TenantManagePage' })

type ListPanelExpose = {
  reload: () => Promise<void>
}

type FormDialogExpose = {
  openCreate: () => void
  openEdit: (row: SystemTenantListItem) => Promise<void>
  openView: (row: SystemTenantListItem) => Promise<void>
}

type ActionDialogsExpose = {
  openPeriod: (row: SystemTenantListItem, mode: 'trial' | 'activate') => void
  openDisable: (row: SystemTenantListItem) => void
  openCode: (row: SystemTenantListItem) => void
  openDelete: (row: SystemTenantListItem) => void
  openClear: (row: SystemTenantListItem) => Promise<void>
  openGrant: (row: SystemTenantListItem) => Promise<void>
}

const listPanelRef = ref<ListPanelExpose>()
const formDialogRef = ref<FormDialogExpose>()
const actionDialogsRef = ref<ActionDialogsExpose>()
const historyDrawerRef = ref<{ open: (row: SystemTenantListItem) => Promise<void> }>()

function reloadList() {
  return listPanelRef.value?.reload()
}

function handleAction(action: TenantActionKey, row: SystemTenantListItem) {
  if (action === 'history') return historyDrawerRef.value?.open(row)
  if (action === 'view') return formDialogRef.value?.openView(row)
  if (action === 'edit') return formDialogRef.value?.openEdit(row)
  if (action === 'trial' || action === 'activate') {
    return actionDialogsRef.value?.openPeriod(row, action)
  }
  if (action === 'grant') return actionDialogsRef.value?.openGrant(row)
  if (action === 'disable') return actionDialogsRef.value?.openDisable(row)
  if (action === 'code') return actionDialogsRef.value?.openCode(row)
  if (action === 'clear') return actionDialogsRef.value?.openClear(row)
  if (action === 'delete') return actionDialogsRef.value?.openDelete(row)
}
</script>

<style scoped>
.tenant-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}
</style>
