import { useDialog, useMsg } from '@grow-admin-rock/components'
import { setSystemPostEnabled } from '../../../api/systemPost'
import type { SystemPostListItem } from '../../../types/systemPost'
import { confirmWarning, toMessage } from './helpers'

type UsePostActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function usePostActions(options: UsePostActionsOptions) {
  const message = useMsg() as any
  const dialog = useDialog()
  async function onToggleEnabled(row: SystemPostListItem, enabled: boolean) {
    if (row.enabled === enabled) return
    if (!enabled) {
      if (row.activePersonCount > 0) {
        message.warning('该岗位下存在有效任职人员，请先调岗、离职或结束任职关系。')
        return
      }
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用岗位「${row.name}」？停用后不可再被新增人员选择。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    try {
      await setSystemPostEnabled(row.id, enabled)
      message.success(enabled ? '已启用' : '已停用')
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    }
  }

  return {
    onToggleEnabled,
  }
}
