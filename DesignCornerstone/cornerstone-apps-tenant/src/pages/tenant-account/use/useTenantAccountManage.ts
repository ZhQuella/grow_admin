import { onMounted } from 'vue'
import { useTenantAccountActions } from './useTenantAccountActions'
import { useTenantAccountForm } from './useTenantAccountForm'
import { useTenantAccountTable } from './useTenantAccountTable'
import { formatTime } from './helpers'

export function useTenantAccountManage() {
  const table = useTenantAccountTable()
  const form = useTenantAccountForm({ onSuccess: table.loadList })
  const actions = useTenantAccountActions({ onSuccess: table.loadList })

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    ...form,
    ...actions,
    formatTime,
  }
}
