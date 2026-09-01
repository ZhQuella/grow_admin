import { onMounted } from 'vue'
import { usePostActions } from './usePostActions'
import { usePostTable } from './usePostTable'
import { formatTime } from './helpers'

export function usePostManage() {
  const table = usePostTable()

  async function refresh() {
    await Promise.all([table.loadDeptTree(), table.loadList()])
  }

  const actions = usePostActions({
    onSuccess: refresh,
  })

  onMounted(() => {
    void refresh()
  })

  return {
    ...table,
    ...actions,
    refresh,
    formatTime,
  }
}
