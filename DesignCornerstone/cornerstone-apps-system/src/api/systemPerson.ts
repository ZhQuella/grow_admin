import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  PersonConfirmPayload,
  PersonDeletePayload,
  PersonHistoryItem,
  PersonReinstatePayload,
  PersonResignPayload,
  PersonStatusPayload,
  PersonTransferPayload,
  SystemPersonDetail,
  SystemPersonPageResult,
  SystemPersonQuery,
  SystemPersonSavePayload,
} from '../types/systemPerson'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemPersonPage(params: SystemPersonQuery) {
  return useRequest().post<SystemPersonPageResult>({
    url: '/system/persons/page',
    data: params,
  })
}

export function getSystemPersonDetail(userId: string) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/detail',
    data: { userId },
  })
}

export function createSystemPerson(data: SystemPersonSavePayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/create',
    data,
  })
}

export function updateSystemPerson(userId: string, data: SystemPersonSavePayload) {
  return useRequest().put<SystemPersonDetail>({
    url: '/system/person',
    data: { ...data, userId },
  })
}

export function deleteSystemPerson(data: PersonDeletePayload) {
  return useRequest().post<{ userId: string }>({
    url: '/system/person/delete',
    data,
  })
}

export function fetchSystemPersonHistory(userId: string) {
  return useRequest().post<PersonHistoryItem[]>({
    url: '/system/person/history',
    data: { userId },
  })
}

export function transferSystemPerson(data: PersonTransferPayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/transfer',
    data,
  })
}

export function confirmSystemPerson(data: PersonConfirmPayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/confirm',
    data,
  })
}

export function resignSystemPerson(data: PersonResignPayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/resign',
    data,
  })
}

export function retireSystemPerson(data: PersonStatusPayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/retire',
    data,
  })
}

export function reinstateSystemPerson(data: PersonReinstatePayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/reinstate',
    data,
  })
}

export function rehireSystemPerson(data: PersonReinstatePayload) {
  return useRequest().post<SystemPersonDetail>({
    url: '/system/person/rehire',
    data,
  })
}
