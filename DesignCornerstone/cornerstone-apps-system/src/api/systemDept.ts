import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemDeptAssignmentDecision,
  SystemDeptDeleteImpact,
  SystemDeptDetail,
  SystemDeptEnableImpact,
  SystemDeptMergeImpact,
  SystemDeptMergePayload,
  SystemDeptNode,
  SystemDeptRelated,
  SystemDeptSavePayload,
  SystemDeptStopImpact,
} from '../types/systemDept'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemDeptTree(includeDisabled = true) {
  return useRequest().post<SystemDeptNode[]>({
    url: '/system/departments/tree',
    data: { includeDisabled },
  })
}

export function getSystemDeptDetail(id: string) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/detail', data: { id } })
}

export function fetchSystemDeptRelated(id: string) {
  return useRequest().post<SystemDeptRelated>({ url: '/system/department/related', data: { id } })
}

export function createSystemDept(data: SystemDeptSavePayload) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/create', data })
}

export function updateSystemDept(id: string, data: SystemDeptSavePayload) {
  return useRequest().put<SystemDeptDetail>({ url: '/system/department', data: { ...data, id } })
}

export function fetchSystemDeptStopImpact(id: string) {
  return useRequest().post<SystemDeptStopImpact>({ url: '/system/department/stop-impact', data: { id } })
}

export function stopSystemDept(id: string, decisions: SystemDeptAssignmentDecision[]) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/stop', data: { id, decisions } })
}

export function fetchSystemDeptEnableImpact(id: string) {
  return useRequest().post<SystemDeptEnableImpact>({ url: '/system/department/enable-impact', data: { id } })
}

export function enableSystemDept(id: string, departmentIds: string[]) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/enable', data: { id, departmentIds } })
}

export function migrateSystemDept(id: string, parentId: string | null) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/migrate', data: { id, parentId } })
}

export function fetchSystemDeptMergeImpact(id: string) {
  return useRequest().post<SystemDeptMergeImpact>({ url: '/system/department/merge-impact', data: { id } })
}

export function mergeSystemDept(data: SystemDeptMergePayload) {
  return useRequest().post<SystemDeptDetail>({ url: '/system/department/merge', data })
}

export function fetchSystemDeptDeleteImpact(id: string, cascade: boolean) {
  return useRequest().post<SystemDeptDeleteImpact>({
    url: '/system/department/delete-impact',
    data: { id, cascade },
  })
}

export function deleteSystemDept(id: string, cascade: boolean, cancelAssignments: boolean) {
  return useRequest().post<{ id: string }>({
    url: '/system/department/delete',
    data: { id, cascade, cancelAssignments },
  })
}
