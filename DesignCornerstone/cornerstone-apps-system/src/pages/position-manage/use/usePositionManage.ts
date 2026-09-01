import { onMounted } from 'vue'
import { usePositionActions } from './usePositionActions'
import { usePositionForm } from './usePositionForm'
import { usePositionTable } from './usePositionTable'
import { formatTime } from './helpers'

export function usePositionManage() {
  const table = usePositionTable()
  const form = usePositionForm({ onSuccess: table.loadList })
  const actions = usePositionActions({ onSuccess: table.loadList })

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
