import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { deleteSystemMenu } from '../../../api/systemMenu'
import type { SystemMenuNode } from '../../../types/systemMenu'
import { countDescendants } from './helpers'

type UseMenuActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useMenuActions(options: UseMenuActionsOptions) {
  const message = useMsg()

  const deleteVisible = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemMenuNode | null>(null)
  const deleteChildCount = ref(0)

  function onDelete(row: SystemMenuNode) {
    deleteTarget.value = row
    deleteChildCount.value = countDescendants(row)
    deleteVisible.value = true
  }

  async function confirmDelete() {
    const target = deleteTarget.value
    if (!target) return

    deleteSubmitting.value = true
    try {
      await deleteSystemMenu(target.name)
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
    deleteSubmitting,
    deleteTarget,
    deleteChildCount,
    onDelete,
    confirmDelete,
  }
}
