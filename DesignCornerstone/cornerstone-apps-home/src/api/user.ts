import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { UserInfo } from '@grow-admin-rock/types'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function getUserInfo() {
  return useRequest().get<UserInfo>({
    url: '/user/info',
  })
}

export function logout() {
  return useRequest().post({
    url: '/logout',
  })
}
