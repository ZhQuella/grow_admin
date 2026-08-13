import { onMounted } from 'vue'
import { formatTime, typeLabel } from './helpers'
import { useAssetActions } from './useAssetActions'
import { useAssetForm } from './useAssetForm'
import { useManageTable } from './useManageTable'

export function useLowcodeAssetManage() {
  const table = useManageTable()
  const form = useAssetForm({ onSuccess: table.loadList })
  const actions = useAssetActions({ onSuccess: table.loadList })

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    ...form,
    ...actions,
    typeLabel,
    formatTime,
  }
}
