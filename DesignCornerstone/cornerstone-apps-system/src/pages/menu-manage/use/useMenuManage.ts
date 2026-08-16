import { onMounted } from 'vue'
import { useMenuActions } from './useMenuActions'
import { useMenuForm } from './useMenuForm'
import { useMenuTable } from './useMenuTable'
import { menuTypeLabel, menuTypeTagType } from './helpers'

export function useMenuManage() {
  const table = useMenuTable()
  const form = useMenuForm({
    sourceTree: table.sourceTree,
    onSuccess: table.loadList,
  })
  const actions = useMenuActions({ onSuccess: table.loadList })

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    ...form,
    ...actions,
    menuTypeLabel,
    menuTypeTagType,
  }
}
