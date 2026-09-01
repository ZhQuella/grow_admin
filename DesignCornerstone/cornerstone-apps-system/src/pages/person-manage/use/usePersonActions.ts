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

  function openDetail(row: SystemPersonListItem) {
    go(
      { name: 'PersonDetail', params: { id: row.userId } },
      { tabMode: 'stack', parentName: 'PersonManage' },
    )
  }

  return {
    openCreate,
    openDetail,
  }
}
