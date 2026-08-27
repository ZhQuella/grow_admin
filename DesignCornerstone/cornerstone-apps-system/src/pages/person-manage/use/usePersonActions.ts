import { useRouteNavigate } from '@grow-admin-rock/hooks'
import type { SystemPersonListItem } from '../../../types/systemPerson'

export function usePersonActions() {
  const { go } = useRouteNavigate()

  function openCreate() {
    go(
      { name: 'PersonCreate' },
      { tabMode: 'stack', parentName: 'PersonManage' },
    )
  }

  function openEdit(row: SystemPersonListItem) {
    go(
      { name: 'PersonEdit', params: { id: row.userId } },
      { tabMode: 'stack', parentName: 'PersonManage' },
    )
  }

  return {
    openCreate,
    openEdit,
  }
}
