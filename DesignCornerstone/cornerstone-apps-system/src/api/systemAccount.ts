import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  AccountHistoryItem,
  SystemAccountAssignPayload,
  SystemAccountBrief,
  SystemAccountCreatePayload,
  SystemAccountDetail,
  SystemAccountPageResult,
  SystemAccountQuery,
  SystemAccountResetPayload,
  SystemAccountUpdatePayload,
} from '../types/systemAccount'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemAccountPage(params: SystemAccountQuery) {
  return useRequest().post<SystemAccountPageResult>({
    url: '/system/accounts/page',
    data: params,
  })
}

export function fetchSystemAccountBriefs() {
  return useRequest().post<SystemAccountBrief[]>({
    url: '/system/accounts',
  })
}

export function getSystemAccountDetail(accountId: string) {
  return useRequest().post<SystemAccountDetail>({
    url: '/system/account/detail',
    data: { accountId },
  })
}

export function createSystemAccount(data: SystemAccountCreatePayload) {
  return useRequest().post<SystemAccountDetail>({
    url: '/system/account/create',
    data,
  })
}

export function updateSystemAccount(accountId: string, data: SystemAccountUpdatePayload) {
  return useRequest().put<SystemAccountDetail>({
    url: '/system/account',
    data: { ...data, accountId },
  })
}

export function setSystemAccountEnabled(accountId: string, enabled: boolean) {
  return useRequest().put<SystemAccountDetail>({
    url: '/system/account/enabled',
    data: { accountId, enabled },
  })
}

export function assignSystemAccount(data: SystemAccountAssignPayload) {
  return useRequest().put<SystemAccountDetail>({
    url: '/system/account/assign',
    data,
  })
}

export function resetSystemAccountPassword(data: SystemAccountResetPayload) {
  return useRequest().put<{ accountId: string }>({
    url: '/system/account/reset-password',
    data,
  })
}

export function fetchSystemAccountHistory(accountId: string) {
  return useRequest().post<AccountHistoryItem[]>({
    url: '/system/account/history',
    data: { accountId },
  })
}
