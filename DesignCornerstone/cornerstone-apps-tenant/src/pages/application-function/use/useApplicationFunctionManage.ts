import { onMounted } from 'vue'
import { useApplicationFunctionActions } from './useApplicationFunctionActions'
import { useApplicationFunctionForm } from './useApplicationFunctionForm'
import { useApplicationFunctionTable } from './useApplicationFunctionTable'
import { useApplicationColumns } from '../components/ColumnConfig/useApplicationColumns'
import { useApplicationFunctions } from '../components/FunctionConfig/useApplicationFunctions'

export function useApplicationFunctionManage() {
  const table = useApplicationFunctionTable()
  const form = useApplicationFunctionForm({
    sourceList: table.sourceList,
    onSuccess: table.loadList,
  })
  const actions = useApplicationFunctionActions({ onSuccess: table.loadList })
  const functionConfig = useApplicationFunctions()
  const columnConfig = useApplicationColumns()

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    functionForm: form,
    functionActions: actions,
    functionConfig,
    columnConfig,
  }
}
