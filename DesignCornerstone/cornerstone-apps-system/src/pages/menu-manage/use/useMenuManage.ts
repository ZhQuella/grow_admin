import { onMounted } from 'vue'
import { useMenuActions } from './useMenuActions'
import { useMenuForm } from './useMenuForm'
import { useMenuTable } from './useMenuTable'
import { useMenuColumns } from '../components/MenuColumnConfig/useMenuColumns'
import { useMenuFunctions } from '../components/MenuFunctionConfig/useMenuFunctions'
import { menuTypeLabel, menuTypeTagType } from './helpers'

export function useMenuManage() {
  const table = useMenuTable()
  const form = useMenuForm({
    sourceTree: table.sourceTree,
    onSuccess: table.loadList,
  })
  const actions = useMenuActions({ onSuccess: table.loadList })
  const functionConfig = useMenuFunctions()
  const columnConfig = useMenuColumns()

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    menuForm: form,
    menuActions: actions,
    functionConfig,
    columnConfig,
    menuTypeLabel,
    menuTypeTagType,
  }
}
