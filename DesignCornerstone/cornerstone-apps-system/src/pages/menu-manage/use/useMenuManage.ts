import { onMounted } from 'vue'
import { useMenuActions } from './useMenuActions'
import { useMenuForm } from './useMenuForm'
import { useMenuTable } from './useMenuTable'
import { useMenuColumns } from '../components/MenuColumnConfig/useMenuColumns'
import { useMenuFunctions } from '../components/MenuFunctionConfig/useMenuFunctions'
import { menuTypeLabel, menuTypeTagType } from './helpers'
import type { SystemMenuApiScope } from '../../../api/systemMenuApiScope'

type UseMenuManageOptions = {
  allowHierarchy?: boolean
  apiScope?: SystemMenuApiScope
}

export function useMenuManage(options: UseMenuManageOptions = {}) {
  const allowHierarchy = options.allowHierarchy !== false
  const apiScope = options.apiScope || 'system'
  const table = useMenuTable({ allowHierarchy, apiScope })
  const form = useMenuForm({
    sourceTree: table.sourceTree,
    onSuccess: table.loadList,
    allowHierarchy,
    apiScope,
  })
  const actions = useMenuActions({ onSuccess: table.loadList, apiScope })
  const functionConfig = useMenuFunctions(apiScope)
  const columnConfig = useMenuColumns(apiScope)

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
