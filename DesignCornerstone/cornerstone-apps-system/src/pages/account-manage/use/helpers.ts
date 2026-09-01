import type { SystemAccountListItem } from '../../../types/systemAccount'
import { employeeStatusLabel } from '../../../types/systemPerson'

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function isSystemAdmin(row: Pick<SystemAccountListItem, 'superAdmin'>) {
  return row.superAdmin
}

export function isRiskPersonStatus(status?: string) {
  return status === 'resigned' || status === 'retired' || status === 'deleted'
}

export function accountPersonStatusLabel(status?: string) {
  return status === 'deleted' ? '已删除' : employeeStatusLabel(status)
}

export function createTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const values = new Uint32Array(8)
  globalThis.crypto?.getRandomValues?.(values)
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

export function pickPersonId(value: string | string[] | '' | undefined) {
  if (value == null || value === '') return ''
  return Array.isArray(value) ? String(value[0] || '') : String(value)
}
