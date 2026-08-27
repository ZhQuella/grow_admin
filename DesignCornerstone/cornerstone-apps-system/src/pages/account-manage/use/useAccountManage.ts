import { onMounted } from 'vue'
import { useAccountActions } from './useAccountActions'
import { useAccountForm } from './useAccountForm'
import { useAccountTable } from './useAccountTable'
import { formatTime, isSystemAdmin } from './helpers'

export function useAccountManage() {
  const table = useAccountTable()
  const form = useAccountForm({ onSuccess: table.loadList })
  const actions = useAccountActions({ onSuccess: table.loadList })

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    ...form,
    ...actions,
    formatTime,
    isSystemAdmin,
  }
}
