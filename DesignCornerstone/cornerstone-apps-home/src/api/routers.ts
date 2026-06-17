import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function getMenuList() {
  return useRequest().get({
    url: '/menu/list'
  })
}
