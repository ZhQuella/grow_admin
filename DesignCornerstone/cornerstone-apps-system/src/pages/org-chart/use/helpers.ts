import type { EmployeeStatus } from '../../../types/systemPerson'

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function statusTag(status?: EmployeeStatus | string) {
  if (status === 'formal' || status === 'rehired') return 'success'
  if (status === 'probation' || status === 'pending') return 'warning'
  return 'info'
}

export function accountStatusLabel(value: boolean | null | undefined) {
  if (value == null) return '未绑定账号'
  return value ? '启用' : '停用'
}

export function parseFlag(value: unknown) {
  return value === true || value === 'true'
}

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function displayText(value?: string | number | null) {
  if (value == null || value === '') return '-'
  return String(value)
}

export const ORG_CHART_COLORS = [
  '#5470c6',
  '#91cc75',
  '#ee6666',
  '#fac858',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
  '#48b8d0',
  '#2a9d8f',
  '#c44569',
]
