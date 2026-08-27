import type { SystemAccountListItem } from '../../../types/systemAccount'

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function isSystemAdmin(row: Pick<SystemAccountListItem, 'accountId' | 'username'>) {
  return row.accountId === 'acc_admin' || row.username === 'admin'
}

export function pickPersonId(value: string | string[] | '' | undefined) {
  if (value == null || value === '') return ''
  return Array.isArray(value) ? String(value[0] || '') : String(value)
}
