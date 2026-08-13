import { onMounted } from 'vue'
import { formatTime } from './helpers'
import { useAssetActions } from './useAssetActions'
import { useAssetForm } from './useAssetForm'
import { useManageTable } from './useManageTable'

export function useReportAssetManage() {
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
    formatTime,
  }
}
