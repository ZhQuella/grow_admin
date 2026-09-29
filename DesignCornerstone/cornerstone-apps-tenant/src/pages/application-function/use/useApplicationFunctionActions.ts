import { ref } from 'vue'
import { useDialog, useMsg } from '@grow-admin-rock/components'
import {
  deleteApplicationFunction,
  fetchApplicationFunctionDeleteImpact,
  setApplicationFunctionEnabled,
} from '../../../api/applicationFunction'
import type { ApplicationFunctionDeleteImpact, ApplicationFunctionNode } from '../../../types/applicationFunction'

type UseMenuActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useApplicationFunctionActions(options: UseMenuActionsOptions) {
  const message = useMsg() as any
  const dialog = useDialog() as any

  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<ApplicationFunctionNode | null>(null)
  const deleteImpact = ref<ApplicationFunctionDeleteImpact | null>(null)
  const statusSubmittingName = ref('')

  async function onDelete(row: ApplicationFunctionNode) {
    deleteTarget.value = row
    deleteImpact.value = null
    deleteLoading.value = true
    try {
      deleteImpact.value = await fetchApplicationFunctionDeleteImpact(row.name)
      deleteVisible.value = true
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载影响范围失败')
    } finally {
      deleteLoading.value = false
    }
  }

  function confirmDisable(row: ApplicationFunctionNode): Promise<boolean> {
    const content = `确认停用「${row.title}」？停用后该应用功能不可访问。`
    if (dialog && typeof (dialog as any).warning === 'function' && (dialog as any).warning.length <= 1) {
      return new Promise((resolve) => {
        ;(dialog as any).warning({
          title: '停用确认',
          content,
          positiveText: '停用',
          negativeText: '取消',
          onPositiveClick: () => resolve(true),
          onNegativeClick: () => resolve(false),
          onClose: () => resolve(false),
        })
      })
    }
    if (dialog && typeof (dialog as any).confirm === 'function') {
      const result = (dialog as any).confirm(content, '停用确认', {
        type: 'warning',
        confirmButtonText: '停用',
        cancelButtonText: '取消',
      })
      if (result && typeof result.then === 'function') {
        return result.then(() => true).catch(() => false)
      }
    }
    return Promise.resolve(window.confirm(content))
  }

  async function onToggleEnabled(row: ApplicationFunctionNode, enabled: boolean) {
    if (row.enabled === enabled || statusSubmittingName.value) return
    if (!enabled && !(await confirmDisable(row))) return

    statusSubmittingName.value = row.name
    try {
      await setApplicationFunctionEnabled(row.name, enabled)
      message.success(enabled ? '已启用' : '已停用')
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '状态更新失败')
    } finally {
      statusSubmittingName.value = ''
    }
  }

  async function confirmDelete() {
    const target = deleteTarget.value
    if (!target) return

    deleteSubmitting.value = true
    try {
      await deleteApplicationFunction(target.name)
      message.success('删除成功')
      deleteVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
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
    statusSubmittingName,
    onDelete,
    onToggleEnabled,
    confirmDelete,
  }
}
