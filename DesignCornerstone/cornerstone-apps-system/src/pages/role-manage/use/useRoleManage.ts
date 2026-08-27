import { onMounted } from 'vue'
import { useRoleActions } from './useRoleActions'
import { useRoleForm } from './useRoleForm'
import { useRoleTable } from './useRoleTable'
import { formatTime } from './helpers'

export function useRoleManage() {
  const table = useRoleTable()
  const form = useRoleForm({ onSuccess: table.loadList })
  const actions = useRoleActions({ onSuccess: table.loadList })

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
