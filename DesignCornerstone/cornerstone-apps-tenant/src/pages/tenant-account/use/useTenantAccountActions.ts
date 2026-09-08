import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { assignTenantAdmin } from '../../../api/systemTenantAccount'
import type { TenantAccountListItem } from '../../../types/systemTenantAccount'
import { toMessage } from './helpers'

type UseTenantAccountActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useTenantAccountActions(options: UseTenantAccountActionsOptions) {
  const message = useMsg() as any

  const assignVisible = ref(false)
  const assignSubmitting = ref(false)
  const assignTarget = ref<TenantAccountListItem | null>(null)

  function openAssign(row: TenantAccountListItem) {
    assignTarget.value = row
    assignVisible.value = true
  }

  async function submitAssign() {
    const target = assignTarget.value
    if (!target) return
    assignSubmitting.value = true
    try {
      await assignTenantAdmin({
        accountId: target.accountId,
        assigned: !target.tenantAdmin,
      })
      message.success(target.tenantAdmin ? '已取消租户管理员' : '已分配租户管理员')
      assignVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    } finally {
      assignSubmitting.value = false
    }
  }

  return {
    assignVisible,
    assignSubmitting,
    assignTarget,
    openAssign,
    submitAssign,
  }
}
