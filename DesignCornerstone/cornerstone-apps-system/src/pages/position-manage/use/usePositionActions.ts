import { ref } from 'vue'
import { useDialog, useMsg } from '@grow-admin-rock/components'
import {
  deleteSystemPosition,
  fetchSystemPositionImpact,
  setSystemPositionEnabled,
} from '../../../api/systemPosition'
import type {
  SystemPositionImpact,
  SystemPositionListItem,
} from '../../../types/systemPosition'
import { confirmWarning, toMessage } from './helpers'

type UsePositionActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function usePositionActions(options: UsePositionActionsOptions) {
  const message = useMsg() as any
  const dialog = useDialog()

  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemPositionListItem | null>(null)
  const deleteImpact = ref<SystemPositionImpact | null>(null)

  async function onToggleEnabled(row: SystemPositionListItem, enabled: boolean) {
    if (row.enabled === enabled) return
    if (!enabled) {
      let impact: SystemPositionImpact | null = null
      try {
        impact = await fetchSystemPositionImpact(row.id)
      } catch (error) {
        message.error(toMessage(error, '加载影响范围失败'))
        return
      }
      const extra = impact.assignmentCount
        ? `\n当前有 ${impact.assignmentCount} 条有效任职正在使用。停用后现有任职保持不变，但不能再被新任职选择。`
        : '\n停用后不能再被新任职选择。'
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用职级「${row.name}」？${extra}`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    try {
      await setSystemPositionEnabled(row.id, enabled)
      message.success(enabled ? '已启用' : '已停用')
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    }
  }

  async function onDelete(row: SystemPositionListItem) {
    if (row.enabled) {
      message.warning('启用中的职级不能删除，请先停用')
      return
    }
    deleteTarget.value = row
    deleteImpact.value = null
    deleteLoading.value = true
    try {
      deleteImpact.value = await fetchSystemPositionImpact(row.id)
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
    if (deleteImpact.value?.assignmentCount) {
      message.warning('该职级仍被有效任职引用，无法删除')
      return
    }

    deleteSubmitting.value = true
    try {
      await deleteSystemPosition(target.id)
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
