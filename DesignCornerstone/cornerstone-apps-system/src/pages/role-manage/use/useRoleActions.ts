import { ref } from 'vue'
import { useDialog, useMsg } from '@grow-admin-rock/components'
import {
  deleteSystemRole,
  fetchSystemRoleDeleteImpact,
  setSystemRoleEnabled,
} from '../../../api/systemRole'
import type {
  SystemRoleDeleteImpact,
  SystemRoleListItem,
} from '../../../types/systemRole'
import { confirmWarning } from './confirmWarning'
import { toMessage } from './helpers'

type UseRoleActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useRoleActions(options: UseRoleActionsOptions) {
  const message = useMsg()
  const dialog = useDialog()

  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemRoleListItem | null>(null)
  const deleteImpact = ref<SystemRoleDeleteImpact | null>(null)

  async function onToggleEnabled(row: SystemRoleListItem, enabled: boolean) {
    if (row.builtIn) {
      message.warning('超级管理员不能停用')
      return
    }
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用角色「${row.name}」？角色停用后，绑定账号将立即失去该角色下的权限。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    try {
      await setSystemRoleEnabled(row.id, enabled)
      message.success(enabled ? '已启用' : '已停用')
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    }
  }

  async function onDelete(row: SystemRoleListItem) {
    if (row.builtIn) {
      message.warning('内置角色不能删除')
      return
    }
    if (row.enabled) {
      message.warning('启用中的角色不能删除，请先停用')
      return
    }
    deleteTarget.value = row
    deleteImpact.value = null
    deleteLoading.value = true
    try {
      deleteImpact.value = await fetchSystemRoleDeleteImpact(row.id)
      deleteVisible.value = true
    } catch (error) {
      message.error(toMessage(error, '加载影响范围失败'))
    } finally {
      deleteLoading.value = false
    }
  }

  async function confirmDelete() {
    const target = deleteTarget.value
    if (!target) return

    deleteSubmitting.value = true
    try {
      await deleteSystemRole(target.id)
      message.success('删除成功')
      deleteVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '删除失败'))
    } finally {
      deleteSubmitting.value = false
    }
  }

  return {
    deleteVisible,
    deleteLoading,
    deleteSubmitting,
    deleteTarget,
    deleteImpact,
    onToggleEnabled,
    onDelete,
    confirmDelete,
  }
}
