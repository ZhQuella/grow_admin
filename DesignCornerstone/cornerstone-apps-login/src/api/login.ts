import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'

export interface LoginMockParams {
  username: string
  password: string
}

export interface LoginMockResponse {
  code: string
  data?: Recordable<any>
  message: string
  type: string
}

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function loginMockTest(params: LoginMockParams) {
  return useRequest().post<LoginMockResponse>(
    {
      url: '/login',
      data: params,
    },
    {
      errorMessageMode: 'none',
      isTransformResponse: false,
    }
  )
}
