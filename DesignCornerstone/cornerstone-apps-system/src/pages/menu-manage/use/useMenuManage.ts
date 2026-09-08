import { onMounted } from 'vue'
import { useMenuActions } from './useMenuActions'
import { useMenuForm } from './useMenuForm'
import { useMenuTable } from './useMenuTable'
import { useMenuColumns } from '../components/MenuColumnConfig/useMenuColumns'
import { useMenuFunctions } from '../components/MenuFunctionConfig/useMenuFunctions'
import { menuTypeLabel, menuTypeTagType } from './helpers'

type UseMenuManageOptions = {
  allowHierarchy?: boolean
}

export function useMenuManage(options: UseMenuManageOptions = {}) {
  const allowHierarchy = options.allowHierarchy !== false
  const table = useMenuTable({ allowHierarchy })
  const form = useMenuForm({
    sourceTree: table.sourceTree,
    onSuccess: table.loadList,
    allowHierarchy,
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
