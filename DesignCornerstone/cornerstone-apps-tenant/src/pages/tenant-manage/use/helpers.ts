import { driverRef } from '@grow-admin-rock/components'
import type { TenantActionKey, TenantStatus, TenantType } from '../../../types/systemTenant'
import {
  TENANT_STATUS_LABELS,
  TENANT_TYPE_OPTIONS,
  type SystemTenantListItem,
} from '../../../types/systemTenant'

export function formatTime(value?: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function formatDate(value?: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

export function formatServicePeriod(row: Pick<SystemTenantListItem, 'startedAt' | 'expiredAt'>) {
  if (!row.startedAt && !row.expiredAt) return '-'
  return `${formatDate(row.startedAt)} 至 ${formatDate(row.expiredAt)}`
}

export function tenantStatusLabel(status: TenantStatus) {
  return TENANT_STATUS_LABELS[status] || status
}

export function tenantStatusTagType(status: TenantStatus) {
  if (status === 'active') return 'success'
  if (status === 'trial') return 'warning'
  if (status === 'expired' || status === 'disabled') return 'danger'
  return 'info'
}

export function tenantTypeLabel(value?: TenantType | string) {
  return TENANT_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '-'
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function todayDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function availableTenantActions(row: SystemTenantListItem): TenantActionKey[] {
  if (row.builtIn) return ['view', 'edit']
  if (row.status === 'deleted') return ['view', 'clear']

  const actions: TenantActionKey[] = ['view', 'edit', 'grant']
  if (row.status === 'not_opened' || row.status === 'expired' || row.status === 'disabled') {
    actions.push('trial', 'activate')
  }
  if (row.status === 'trial') actions.push('activate')
  if (row.status === 'trial' || row.status === 'active') actions.push('disable')
  actions.push('code', 'clear', 'delete')
  return actions
}

export async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) {
    throw new Error('表单未就绪')
  }
  const result = await form.validate()
  if (result === false) {
    throw new Error('校验未通过')
  }
}

export function pickCheckedKeys(arg1: unknown, arg2?: unknown): string[] {
  if (arg2 && typeof arg2 === 'object' && Array.isArray((arg2 as { checkedKeys?: unknown }).checkedKeys)) {
    return [...(arg2 as { checkedKeys: string[] }).checkedKeys]
  }
  if (Array.isArray(arg1)) return [...arg1]
  return []
}
